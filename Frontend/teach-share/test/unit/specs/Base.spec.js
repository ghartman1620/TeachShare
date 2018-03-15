import Vue from "vue";
import Base from "@/components/Base";
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

describe("Base.vue", () => {
    it("should render correct contents", () => {
        const Constructor = Vue.extend(Base);

        const vm = new Constructor({ router, store }).$mount();
        // console.log(vm.$data);
        let re = new RegExp("([\\n]|[\\s])*", "g");
        let val = vm.$el
            .querySelector(".navbar")
            .textContent.trim()
            .replace(re, "");
        // console.log("VAL: ", val);
        expect(
            vm.$el
            .querySelector(".navbar")
            .textContent.trim()
            .replace(re, "")
        ).to.equal(
            "CreatePostProfileYourpostfeedYourpostsAccountdetailsLogoutSearch"
        );
    });
    it("should have a queryParam data item", () => {
        const Constructor = Vue.extend(Base);
        const vm = new Constructor({ router, store }).$mount();
        const qp = vm.queryParam;
        // console.log("TYPE OF: ", typeof vm);
        // // expect(typeof vm.$data).toBe("function");
        // console.log(Object.keys(vm));

        // const qp = vm.$data()
        expect(qp).to.equal("");
        // iterChildren(vm.$children);
    });
});

function iterChildren(children) {
    _.forEach(children, function(val, key) {
        // console.log(key, ': ', val, '\n\n\n')
        _.forEach(val, function(val, key) {
            console.log(key);
        });
    });
}