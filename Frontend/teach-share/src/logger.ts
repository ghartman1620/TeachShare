import logFull from "./log";

import _Vue from "vue"; 

// export type PluginFunction<T> = (Vue: typeof _Vue, options?: T) => void;
export default function LoggerPlugin(Vue: typeof _Vue, options?: any): void {
    var showLogging = options;
    if (showLogging) {
        Vue.prototype.$log = function (...args: any[]) {
            this.log({level: "", depth: 5, args: args});
        };
        Vue.prototype.$l = function (...args: any[]) {
            this.log({level: "", depth: 5, args: args});
        };
        Vue.prototype.log = function (level: any, depth: any, ...args: any[]) {
            logFull(level, depth, args);
            console.log("");
        };
        Vue.prototype.$logSuccess = function (...args: any[]) {
            this.log({level: "success", depth: 5, args: args});
        };
        Vue.prototype.$logWarning = function (...args: any[]) {
            this.log({level: "warning", depth: 5, args: args});
        };
        Vue.prototype.$logDanger = function (...args: any[]) {
            this.log({level: "danger", depth: 5, args: args});
        };
        Vue.mixin({

        });
    }
}
