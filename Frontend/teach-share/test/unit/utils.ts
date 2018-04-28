import VeeValidate from "vee-validate";
import Vue, {VueConstructor} from "vue";
import router from "../../src/router";
import store from "../../src/store";

export const CONSTRUCT = (component: any): object & Record<never, any> & Vue => {
    Vue.use(VeeValidate);
    const ctor = Vue.extend(component);
    return new ctor({ router, store }).$mount();
};
