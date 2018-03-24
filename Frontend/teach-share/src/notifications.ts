import Vue from "vue";
import store from "./store";
import Notify from "./components/Notify.vue";

const Notifications = {
    install (Vue: any, options: any) {
        Vue.prototype.$notify = function (type: any, content: any) {
            store.dispatch("sendNotification", {"type": type, "content": content});
        };
        Vue.prototype.$notifySuccess = function (content) {
            store.dispatch("sendNotification", {"type": "success", "content": content});
        };
        Vue.prototype.$notifyDanger = function (content) {
            store.dispatch("sendNotification", {"type": "danger", "content": content});
        };
        Vue.prototype.$notifyInfo = function (content) {
            store.dispatch("sendNotification", {"type": "info", "content": content});
        };
        Vue.prototype.$notifyWarning = function (content) {
            store.dispatch("sendNotification", {"type": "warning", "content": content});
        };
        Vue.prototype.$notifyPrimary = function (content) {
            store.dispatch("sendNotification", {"type": "primary", "content": content});
        };
        Vue.prototype.$notifySecondary = function (content) {
            store.dispatch("sendNotification", {"type": "secondary", "content": content});
        };
        Vue.prototype.$notifyDark = function (content) {
            store.dispatch("sendNotification", {"type": "dark", "content": content});
        };
        Vue.prototype.$notifyLight = function (content) {
            store.dispatch("sendNotification", {"type": "light", "content": content});
        };
        Vue.mixin({

        });
    }
};

export default Notifications;