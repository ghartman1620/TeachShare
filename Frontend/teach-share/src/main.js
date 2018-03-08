// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import Vuex from "vuex";
import VeeValidate, { Validator } from "vee-validate";
import Notifications from "./notifications";

// our stuff
import App from "./App.vue";
import router from "./router";
import store from "./store";

import {
    Carousel,
    Alert,
    Card,
    FormTextarea,
    Button,
    Layout,
    Badge
} from "bootstrap-vue/es/components";

// font-awesome icons
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import fontawesome from "@fortawesome/fontawesome";
// import brands from "@fortawesome/fontawesome-free-brands";
import faPlus from "@fortawesome/fontawesome-free-solid/faPlus";
import faUndo from "@fortawesome/fontawesome-free-solid/faUndo";
import faRedo from "@fortawesome/fontawesome-free-solid/faRedo";
import faCheck from "@fortawesome/fontawesome-free-solid/faCheck";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";
import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";
import faUserCircle from "@fortawesome/fontawesome-free-solid/faUserCircle";

fontawesome.library.add(
    faPlus,
    faUndo,
    faRedo,
    faCheck,
    faTimes,
    faEdit,
    faUserCircle
);

// moment.js for date formatting
Vue.use(require("vue-moment"));

Vue.use(Carousel);
Vue.use(Alert);
Vue.use(Card);
Vue.use(FormTextarea);
Vue.use(Button);
Vue.use(Layout);
Vue.use(Badge);

Vue.use(Notifications);

Validator.extend("YoutubeEmbedURL", {
    getMessage: field => "The " + field + " value is not a valid YouTube link.",
    validate: value => {
        var videoURL = new URL(value);
        var videoID = videoURL.searchParams.get("v");
        if (videoID) {
            return true;
        }
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