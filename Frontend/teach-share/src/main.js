// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'
import Vuex from 'vuex';
import App from './App.vue';
import router from './router';
import store from './store';

require('bootstrap');

Vue.config.productionTip = false;
Vue.use(Vuex);

// This would declare Element button as a component,
// but I couldn't get Element UI stuff to work. -JL
// Vue.component(Button.name, Button);


/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>'
});

