// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import Vuex from "vuex";
import VeeValidate, { Validator } from "vee-validate";
import Notifications from "./notifications";
import Logger from "./logger";

// our stuff
import App from "./App.vue";
import router from "./router";
import store from "./store";

import {
    Carousel,
    Alert,
    Card,
    Collapse,
    Navbar,
    Button,
    Layout,
    Image,

    Form,
    FormGroup,
    FormInput,
    FormRadio,
    FormSelect,
    FormTextarea,
    FormCheckbox,

    Badge,
    Jumbotron

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
import faArrowLeft from "@fortawesome/fontawesome-free-solid/faArrowLeft";
import faArrowRight from "@fortawesome/fontawesome-free-solid/faArrowRight";

fontawesome.library.add(
    faPlus,
    faUndo,
    faRedo,
    faCheck,
    faTimes,
    faEdit,
    faUserCircle,
    faArrowLeft,
    faArrowRight
);

// moment.js for date formatting
Vue.use(require("vue-moment"));

// vue-cookie because js cookies are awful
Vue.use(require("vue-cookie"));

Vue.use(Carousel);
Vue.use(Jumbotron);
Vue.use(Alert);
Vue.use(Collapse);
Vue.use(Card);
Vue.use(Navbar);

Vue.use(Button);
Vue.use(Layout);

Vue.use(Form);
Vue.use(FormGroup);
Vue.use(FormInput);
Vue.use(FormRadio);
Vue.use(FormSelect);
Vue.use(FormTextarea);
Vue.use(FormCheckbox);
Vue.use(Image);

Vue.use(Badge);

Vue.use(Notifications);
Vue.use(Logger, true);

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