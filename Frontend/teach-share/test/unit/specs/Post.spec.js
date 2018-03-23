import Vue from "vue";
import Post from "@/components/Post";
import router from "@/router";
import store from "@/store";
import _ from "lodash";

// font-awesome icons
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import fontawesome from "@fortawesome/fontawesome";

import faUserCircle from "@fortawesome/fontawesome-free-solid/faUserCircle";
import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";

fontawesome.library.add(faUserCircle, faEdit);

// vue-cookie because js cookies are awful
Vue.use(require("vue-cookie"));

// testing
var util = require("util");

describe("Post.vue", () => {
    it("should render correct contents", () => {
        const Constructor = Vue.extend(Post);
        const vm = new Constructor({ router, store }).$mount();
        // console.log("Post vm Values: ", Object.values(vm));
        // for (let o of Object.keys(vm)) {
        //     console.log(o);
        // }
        // console.log("ATTRS: ", Object.keys(vm.$attrs));
        // console.log("CHILDREN: ", Object.keys(vm.$children));
        // console.log("CREATE ELEMENT: ", Object.keys(vm.$createElement));
        // console.log("DATA: ", Object.keys(vm.$data));
        console.log("EL: ", Object.keys(vm.$el.data));
        // console.log("LISTENERS: ", Object.keys(vm.$listeners));
        // console.log("PROPS: ", Object.keys(vm.$props));
        // console.log("REFS: ", Object.keys(vm.$refs));
        // console.log("SET: ", Object.keys(vm.$set));
        // console.log("VNODE: ", vm.$vnode);
    });
});