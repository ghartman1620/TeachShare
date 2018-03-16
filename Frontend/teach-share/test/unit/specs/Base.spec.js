import Vue from "vue";
import Base from "@/components/Base";
import router from "@/router";
import store from "@/store";
import _ from "lodash";

// font-awesome icons
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import fontawesome from "@fortawesome/fontawesome";
// import brands from "@fortawesome/fontawesome-free-brands";
import faPlus from "@fortawesome/fontawesome-free-solid/faPlus";
import faUndo from "@fortawesome/fontawesome-free-solid/faUndo";
import faRedo from "@fortawesome/fontawesome-free-solid/faRedo";
import faCheck from "@fortawesome/fontawesome-free-solid/faCheck";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";
import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";
import faUserCircle from "@fortawesome/fontawesome-free-solid/faUserCircle";
import faArrowLeft from "@fortawesome/fontawesome-free-solid/faArrowLeft";
import faArrowRight from "@fortawesome/fontawesome-free-solid/faArrowRight";

fontawesome.library.add(
    faPlus,
    faUndo,
    faRedo,
    faCheck,
    faTimes,
    faEdit,
    faUserCircle,
    faArrowLeft,
    faArrowRight
);

// moment.js for date formatting
Vue.use(require("vue-moment"));

// vue-cookie because js cookies are awful
Vue.use(require("vue-cookie"));

describe("Base.vue", () => {
    it("should render correct contents", () => {
        const Constructor = Vue.extend(Base);
        const vm = new Constructor({router, store}).$mount();
        console.log(vm.$el);
        let re = new RegExp("([\\n]|[\\s])*", "g");
        let nav = vm.$el.querySelector(".navbar").textContent.trim().replace(re, "");
        console.log(nav);
        expect(nav)
            .to.equal("CreatePostProfileYourpostfeedYourpostsAccountdetailsLogoutSearch");
    });
    it("should have a queryParam data item", () => {
        const Constructor = Vue.extend(Base);
        const vm = new Constructor({router, store}).$mount();
        const qp = vm.queryParam;
        // expect(typeof vm.$data).toBe('function')
        // const qp = vm.$data()
        expect(qp).to.equal("");
        // console.log(vm.$children)
        _.forEach(vm.$children, function (val, key) {
            // console.log(key, ': ', val, '\n\n\n')
            _.forEach(val, function (val, key) {
                // console.log(key);
            });
        });
    });
    it("should do some stuff..?", () => {
        const Constructor = Vue.extend(Base);
        const vm = new Constructor({router, store}).$createElement("img");
        console.log(vm);
        // let img = Vue.$createElement("img");
        // console.log(img);
    });
});