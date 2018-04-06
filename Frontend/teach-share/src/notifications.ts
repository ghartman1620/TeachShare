import _Vue from "vue";

import { NotifyType } from "./models";
import store from "./store";
import { sendNotification } from "./store_modules/NotificationService";

export default function Notifications(Vue: typeof _Vue, options?: any): void {
    Vue.prototype.$notify = (type: NotifyType, content: any) => {
        sendNotification(store, { type, content });
    };
    Vue.prototype.$notifySuccess = (content: any) => {
        sendNotification(store, { type: NotifyType.success, content });
        // store.dispatch("notify/sendNotification", { "type": NotifyType.success, "content": content });
    };
    Vue.prototype.$notifyDanger = (content: any) => {
        sendNotification(store, { type: NotifyType.danger, content });
    };
    Vue.prototype.$notifyInfo = (content: any) => {
        sendNotification(store, { type: NotifyType.info, content });
    };
    Vue.prototype.$notifyWarning = (content: any) => {
        sendNotification(store, { type: NotifyType.warning, content });
    };
    Vue.prototype.$notifyPrimary = (content: any) => {
        sendNotification(store, { type: NotifyType.primary, content });
    };
    Vue.prototype.$notifySecondary = (content: any) => {
        sendNotification(store, {
            type: NotifyType.secondary,
            content
        });
    };
    Vue.prototype.$notifyDark = (content: any) => {
        sendNotification(store, { type: NotifyType.dark, content });
    };
    Vue.prototype.$notifyLight = (content: any) => {
        sendNotification(store, { type: NotifyType.light, content });
    };
}
