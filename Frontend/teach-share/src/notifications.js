import Vue from "vue";
import store from "./store";
import Notify from "./components/Notify";

const Notifications = {
    install (Vue, options) {
        Vue.prototype.$notify = function (type, content) {
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

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== "undefined" && window.Vue) {
    window.Vue.use(Notifications);
}

export default Notifications;