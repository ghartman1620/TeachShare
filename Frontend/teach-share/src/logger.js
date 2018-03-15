import Vue from "vue";
import logFull from "./log";

const Logger = {
    install (Vue, options) {
        var showLogging = options;
        if (showLogging) {
            Vue.prototype.$log = function (...args) {
                this.log({level: "", depth: 5, args: args});
            };
            Vue.prototype.$l = function (...args) {
                this.log({level: "", depth: 5, args: args});
            };
            Vue.prototype.log = function ({level, depth, ...args} = {}) {
                logFull(level, depth, args.args);
                console.log("");
            };
            Vue.prototype.$logSuccess = function (...args) {
                this.log({level: "success", depth: 5, args: args});
            };
            Vue.prototype.$logWarning = function (...args) {
                this.log({level: "warning", depth: 5, args: args});
            };
            Vue.prototype.$logDanger = function (...args) {
                this.log({level: "danger", depth: 5, args: args});
            };
            Vue.mixin({

            });
        }
    }
};

// Automatic installation if Vue has been added to the global scope.
if (typeof window !== "undefined" && window.Vue) {
    window.Vue.use(Logger);
}

export default Logger;