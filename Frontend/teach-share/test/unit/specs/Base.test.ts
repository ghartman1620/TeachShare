import { expect } from "chai";
import Vue, { VueConstructor } from "vue";
import Base from "../../../src/components/Base.vue";
import router from "../../../src/router";
import store from "../../../src/store";

import { CONSTRUCT } from "../utils";

describe("[BASE.VUE] Base view component", () => {
    it("should render correct contents", () => {
        const vm = CONSTRUCT(Base);
        const re = new RegExp("([\\n]|[\\s])*", "g");
        const val = vm.$el.querySelector(".navbar") as Element;
        const outstring = val.textContent.replace(re, "") as string;
        expect(outstring).to.equal(
            "CreatePostProfileYourpostfeedYourpostsAccountdetailsLogoutSearch"
        );
    });
    it("should have a queryParam data item", () => {
        const vm = CONSTRUCT(Base);
        const qp = vm.$data.queryParam;
        expect(qp).to.equal("");
    });
    it("should have the correct innerhtml", () => {
        const vm = CONSTRUCT(Base);
        console.log(vm.$el.children.length);
        console.log(
            vm.$el.childNodes.forEach((val, ind, obj) => {
                console.log(ind, val);
            })
        );
        console.log(vm.$el.children.item(0));
        console.log(vm.$el.children.item(1));
    });
});

