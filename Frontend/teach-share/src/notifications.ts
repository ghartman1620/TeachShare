import _Vue from "vue";
import store from "./store";
import Notify from "./components/Notify.vue";

export default function Notifications(Vue: typeof _Vue, options?: any): void {
    Vue.prototype.$notify = function (type: any, content: any) {
        store.dispatch("sendNotification", {"type": type, "content": content});
    };
    Vue.prototype.$notifySuccess = function (content: any) {
        store.dispatch("sendNotification", {"type": "success", "content": content});
    };
    Vue.prototype.$notifyDanger = function (content: any) {
        store.dispatch("sendNotification", {"type": "danger", "content": content});
    };
    Vue.prototype.$notifyInfo = function (content: any) {
        store.dispatch("sendNotification", {"type": "info", "content": content});
    };
    Vue.prototype.$notifyWarning = function (content: any) {
        store.dispatch("sendNotification", {"type": "warning", "content": content});
    };
    Vue.prototype.$notifyPrimary = function (content: any) {
        store.dispatch("sendNotification", {"type": "primary", "content": content});
    };
    Vue.prototype.$notifySecondary = function (content: any) {
        store.dispatch("sendNotification", {"type": "secondary", "content": content});
    };
    Vue.prototype.$notifyDark = function (content: any) {
        store.dispatch("sendNotification", {"type": "dark", "content": content});
    };
    Vue.prototype.$notifyLight = function (content: any) {
        store.dispatch("sendNotification", {"type": "light", "content": content});
    };
    Vue.mixin({

    });
}
