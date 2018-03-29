import Vue from "vue";
import Base from "../../../src/components/Base.vue";
import router from "../../../src/router";
// import store from "../../../src/store";
import { expect } from "chai";

// font-awesome icons
// import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
// import fontawesome from "@fortawesome/fontawesome";

// import faUserCircle from "@fortawesome/fontawesome-free-solid/faUserCircle";
// import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";

// fontawesome.library.add(faUserCircle, faEdit);

// vue-cookie because js cookies are awful
// Vue.use(require("vue-cookie"));

describe("[BASE.VUE] Base view component", () => {
    it("should render correct contents", () => {
        // const Constructor = Vue.extend(Base);

        
        // const vm = new Constructor({ router }).$mount();
        
        // console.log(vm.$data);
        // let re = new RegExp("([\\n]|[\\s])*", "g");
        // var val: Element;
        // val = vm.$el
        //     .querySelector(".navbar") as Element;
        
        // let outstring = val.textContent.replace(re, "") as string;
        
        // // console.log("VAL: ", val);
        // expect(outstring).to.equal(
        //     "CreatePostProfileYourpostfeedYourpostsAccountdetailsLogoutSearch"
        // );
    });
    it("should have a queryParam data item", () => {
        // const Constructor = Vue.extend(Base);
        // const vm = new Constructor({ router, store }).$mount();
        // const qp = vm.$data.queryParam;
        // // console.log("TYPE OF: ", typeof vm);
        // // // expect(typeof vm.$data).toBe("function");
        // // console.log(Object.keys(vm));

        // // const qp = vm.$data()
        // expect(qp).to.equal("");
        // iterChildren(vm.$children);
    });
});

// function iterChildren (children) {
//     _.forEach(children, function (val, key) {
//         // console.log(key, ': ', val, '\n\n\n')
//         _.forEach(val, function (val, key) {
//             console.log(key);
//         });
//     });
// }

function test(val: "something" | "else") {

}