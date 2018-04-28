import Vue, {VueConstructor} from "vue";
import router from "../../src/router";
import store from "../../src/store";
import VeeValidate, { Validator } from "vee-validate";

export const CONSTRUCT = function (component: any): object & Record<never, any> & Vue {
    Vue.use(VeeValidate);
    let ctor = Vue.extend(component);
    return new ctor({ router, store }).$mount();
}