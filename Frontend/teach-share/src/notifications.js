import Vue from "vue";
import store from "./store";
import Notify from "./components/Notify";

const Notifications = {
    install (Vue, options) {
        // let notifications = [];
        // let Constr = Vue.extend(Notify);
        // let N = new Constr();

        Vue.prototype.$notify = function (type, content) {
            console.log("Notifications: ", type, content);
            // notifications.push({"type": type, "content": content});
            store.dispatch("sendNotification", {"type": type, "content": content});
            // N.notification = Object.assign(N.notification, {
            //     msgType: type,
            //     msg: content
            // });

            // let vm = N.$mount();
            // document.querySelector("body").appendChild(vm.$el);
        };
        Vue.prototype.$notifications = function () {
            return this.notifications;
        };
        Vue.prototype.notificationSuccess = "SUCCESS";
        Vue.prototype.notificationWarning = "WARNING";
        Vue.mixin({

        });
    }
};

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== "undefined" && window.Vue) {
    window.Vue.use(Notifications);
}

export default Notifications;