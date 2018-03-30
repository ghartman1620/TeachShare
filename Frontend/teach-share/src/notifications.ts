import _Vue from "vue";
import store from "./store";
import Notify from "./components/Notify.vue";
import { Notification as N, NotifyType } from "./models";
import {
    sendNotification, removeNotification
} from "./store_modules/notify/NotificationService";

export default function Notifications(Vue: typeof _Vue, options?: any): void {
    Vue.prototype.$notify = function (type: NotifyType, content: any) {
        sendNotification(store, {"type": type, "content": content});
    };
    Vue.prototype.$notifySuccess = function (content: any) {
        sendNotification(store, { "type": NotifyType.success, "content": content });
        // store.dispatch("notify/sendNotification", { "type": NotifyType.success, "content": content });
    };
    Vue.prototype.$notifyDanger = function (content: any) {
        sendNotification(store, {"type": NotifyType.danger, "content": content});
    };
    Vue.prototype.$notifyInfo = function (content: any) {
        sendNotification(store, {"type": NotifyType.info, "content": content});
    };
    Vue.prototype.$notifyWarning = function (content: any) {
        sendNotification(store, {"type": NotifyType.warning, "content": content});
    };
    Vue.prototype.$notifyPrimary = function (content: any) {
        sendNotification(store, {type: NotifyType.primary, "content": content});
    };
    Vue.prototype.$notifySecondary = function (content: any) {
        sendNotification(store, {type: NotifyType.secondary, "content": content});
    };
    Vue.prototype.$notifyDark = function (content: any) {
        sendNotification(store, {type: NotifyType.dark, "content": content});
    };
    Vue.prototype.$notifyLight = function (content: any) {
        sendNotification(store, {type: NotifyType.light, "content": content});
    };
}
