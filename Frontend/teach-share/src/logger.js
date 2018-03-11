import Vue from "vue";
import $log from "./log";

const Logger = {
    install (Vue, options) {
        var showLogging = options;
        if (showLogging) {
            Vue.prototype.$log = $log;
        }
        Vue.mixin({

        });
    }
};

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== "undefined" && window.Vue) {
    window.Vue.use(Logger);
}

export default Logger;