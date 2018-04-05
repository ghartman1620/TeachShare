// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import Vuex from "vuex";
import VeeValidate, { Validator } from "vee-validate";
import Notifications from "./notifications";
import Logger from "./logging/logger";
import UserPlugin from "./user";

// our stuff
import App from "./App.vue";
import router from "./router";

import store from "./store";

// typescript 'require' workaround hack
declare function require(name: string): any;

import {
    Carousel,
    Alert,
    Card,
    Collapse,
    Navbar,
    Button,
    Layout,

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
import fontawesome from "@fortawesome/fontawesome";

// import brands from "@fortawesome/fontawesome-free-brands";
import * as faPlus from "@fortawesome/fontawesome-free-solid/faPlus";
import * as faUndo from "@fortawesome/fontawesome-free-solid/faUndo";
import * as faRedo from "@fortawesome/fontawesome-free-solid/faRedo";
import * as faCheck from "@fortawesome/fontawesome-free-solid/faCheck";
import * as faTimes from "@fortawesome/fontawesome-free-solid/faTimes";
import * as faEdit from "@fortawesome/fontawesome-free-solid/faEdit";
import * as faUserCircle from "@fortawesome/fontawesome-free-solid/faUserCircle";
import * as faArrowLeft from "@fortawesome/fontawesome-free-solid/faArrowLeft";
import * as faArrowRight from "@fortawesome/fontawesome-free-solid/faArrowRight";

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

// // vue-cookie because js cookies are awful
var VueCookie = require("vue-cookie");
Vue.use(VueCookie);

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

Vue.use(Badge);

// This is frustrating. We are 'suppose' to be able to create *.d.ts files for types such as this
// but it only seems to work when I put it here. This is mostly just for plugins I think, though.
import _Vue from "vue";
declare module "vue/types/vue" {
    export interface Vue {
        $log(...args: any[]): void;
        $logDanger(...args: any[]): void;
        $notify(type: any, content: any): void;
        $notifySuccess(content: string): void;
        $notifyDanger(content: string): void;
        $notifyInfo(content: string): void;
        $notifyWarning(content: string): void;
        $notifyPrimary(content: string): void;
        $notifySecondary(content: string): void;
        $notifyDark(content: string): void;
        $notifyLight(content: string): void;
    }
}

Vue.use(Notifications);
Vue.use(Logger, true);

Validator.extend("YoutubeEmbedURL", {
    getMessage: (field: any) => "The " + field + " value is not a valid YouTube link.",
    validate: (value: any) => {
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
