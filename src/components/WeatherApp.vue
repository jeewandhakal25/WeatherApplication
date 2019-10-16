<template>
    <div>
        <v-app-bar
                app
                clipped-left
                color="blue lighten-3"
        >
            <!--        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>-->
            <span class="title ml-3 mr-5">Weather&nbsp;<span class="font-weight-light">Application</span></span>
            <v-text-field
                    solo-inverted
                    flat
                    hide-details
                    label="Search Location"
                    v-model="address_detail.formatted_address"
                    prepend-inner-icon="mdi-cloud-search-outline"
            ></v-text-field>
            <v-btn text icon color="black" :loading="fetchingLocation" @click="searchLocation">
                <v-icon>mdi-search-web</v-icon>
            </v-btn>
            <v-spacer></v-spacer>

        </v-app-bar>
        <v-content>
            <v-container
                    fluid
                    class="grey lighten-4 fill-height"
            >
                <v-row
                        justify="center"
                        align="center"
                >

                    <div class="text-center mt-12" v-if="fetchingLocation">
                        <v-progress-circular
                                :size="70"
                                :width="4"
                                color="purple"
                                indeterminate
                        ></v-progress-circular>
                        <p>Getting location data.</p>
                    </div>
                    <div v-if="!locationFetched && !fetchingLocation" class="mt-10 mb-10 text-center">
                        <p>Something went wrong while fetching your current location. <br>Try typing your location
                            manually and search. <br><br>
                        OR <br><br>
                        Check whether you've allowed location access</p>
                    </div>
                    <div v-if="locationFetched && !fetchingLocation" class="text-center">
                        <div class="current--weather">
                            {{ currentdata.temperature }}
                            <span>°C</span>
                        </div>
                        <div>
                            <img :src="currentdata.weather_icons" alt="" class="weather--icon">
                        </div>
                        <p><i>{{ currentdata.weather_description }}</i> <br> (Weather details recorded at <strong>{{currentdata.recorded_time}}</strong>)
                        </p>
                        <p><strong>Detailed Location: </strong>{{ currentdata.formatted_address }}</p>
                    </div>
                </v-row>
            </v-container>
        </v-content>
    </div>
</template>

<script>
    export default {
        data: () => ({
            fetchingLocation: false,
            locationFetched: false,
            coords: {},
            address_detail: {
                formatted_address: ''
            },
            weatherdata: {},
            currentdata: {
                temperature: '',
                weather_description: '',
                weather_icons: '',
                recorded_time: '',
                formatted_address: ''
            }
        }),
        async mounted() {
            await this.weatherDetailsOrganize()
        },

        methods: {
            weatherDetailsOrganize: async function () {
                await this.getCurrentGeoLocation();
            },

            getCurrentGeoLocation: async function () {
                this.fetchingLocation = true
                await this.$getLocation({
                    enableHighAccuracy: true, //defaults to false
                    timeout: 10000, //defaults to Infinity
                    maximumAge: 0 //defaults to 0

                }).then(coordinates => {
                    this.coords = coordinates
                    this.fetchingLocation = false
                    this.locationFetched = true;
                }).catch(error => {
                    this.fetchingLocation = false
                    this.locationFetched = false;
                });

                await this.reverseGeoCoding()
                await this.getWeatherInfo();
            },

            reverseGeoCoding: function () {
                var context = this
                var address_detail_;
                var geocoder = new google.maps.Geocoder;
                var latlng = {lat: parseFloat(this.coords.lat), lng: parseFloat(this.coords.lng)};
                return new Promise(function (resolve, reject) {
                    geocoder.geocode({'location': latlng}, function (results, status) {
                        if (status === 'OK') {
                            if (results[0]) {
                                context.address_detail = results[0]
                                context.currentdata.formatted_address = results[0].formatted_address
                                address_detail_ = results[0];
                                resolve(address_detail_);
                            } else {
                                window.alert('No results found');
                            }
                        } else {
                            this.fetchingLocation = false
                            this.locationFetched = false;

                        }
                    });
                })
            },

            forwardGeoCoding: function () {
                var geocoder = new google.maps.Geocoder;
                var context = this
                var address_detail_;
                return new Promise(function (resolve, reject) {
                    geocoder.geocode({'address': context.address_detail.formatted_address}, function (results, status) {
                        if (status === 'OK') {
                            if (results[0]) {
                                context.address_detail = results[0]
                                context.currentdata.formatted_address = results[0].formatted_address
                                address_detail_ = results[0];
                                resolve(address_detail_);
                            } else {
                                window.alert('No results found');
                            }
                        } else {
                            resolve(address_detail_)
                        }
                    });
                })
            },

            getWeatherInfo: async function () {
                if (this.currentdata.formatted_address) {
                    await this.getWeatherFullData()
                    this.organizeCurrentWeatherData()
                }else {
                    this.fetchingLocation = false
                    this.locationFetched = false
                }
            },

            getWeatherFullData: async function () {
                // var weatherApi =
                //     'https://csm.fusioncharts.com/files/assets/wb/wb-data.php?src=darksky&lat=' +
                //     this.coords.lat +
                //     '&awaitlong=' +
                //     this.coords.lng;
                var weatherApi = "http://api.weatherstack.com/current?access_key=94d6733428cf507f88d101e05027c66e&query=" + this.currentdata.formatted_address
                var weatherApiResponse = await axios.get(weatherApi);
                if (weatherApiResponse.status === 200) {
                    this.weatherdata = weatherApiResponse.data
                } else {
                    alert('Hmm... Seems like our weather experts are busy!');
                }
            },

            organizeCurrentWeatherData: function () {
                this.currentdata.temperature = this.weatherdata.current.temperature
                this.currentdata.weather_description = this.weatherdata.current.weather_descriptions[0]
                this.currentdata.weather_icons = this.weatherdata.current.weather_icons[0]
                this.currentdata.recorded_time = this.weatherdata.current.observation_time

                this.fetchingLocation = false
                this.locationFetched = true
            },

            searchLocation: async function () {
                this.fetchingLocation = true
                await this.forwardGeoCoding()
                await this.getWeatherInfo();
            }
        }
    };
</script>

<style lang="scss">
    .logo--image {
        width: 50px;
    }

    .app--name {
        font-size: 20px;
        margin-left: 20px;
    }

    .current--weather {
        font-size: 100px;

        span {
            font-size: 37px;
            /* color: #ffffff; */
            line-height: 42px;
            vertical-align: super;
            opacity: 0.8;
            top: 43px;
            position: absolute;

        }
    }

    .weather--icon {
        border-radius: 50px;
        width: 100px;
    }
</style>