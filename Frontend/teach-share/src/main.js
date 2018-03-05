// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import Vuex from "vuex";
import VeeValidate, {Validator} from "vee-validate";
import Notifications from "./notifications";

// our stuff
import App from "./App.vue";
import router from "./router";
import store from "./store";

import { Carousel, Alert } from "bootstrap-vue/es/components";

Vue.use(Carousel);
Vue.use(Alert);

Vue.use(Notifications);

Validator.extend("YoutubeEmbedURL", {
    getMessage: field => "The " + field + " value is not a valid YouTube link.",
    validate: value => {
        console.log(value);
        var videoURL = new URL(value);
        var videoID = videoURL.searchParams.get("v");
        console.log(videoID);
        if (videoID) { return true; }
        return false;
    }
});

require("bootstrap");

Vue.use(Vuex);
Vue.use(VeeValidate);

/* eslint-disable no-new */
new Vue({
    el: "#app",
    router,
    store,
    components: { App },
    template: "<App/>"

});