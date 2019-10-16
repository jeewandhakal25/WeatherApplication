import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueGeolocation from 'vue-browser-geolocation';
Vue.use(VueGeolocation);
window.axios = require('axios'); // for handling weather api promise


Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
