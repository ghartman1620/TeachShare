import { expect } from "chai";
import sinon from "sinon";
import Vue from "vue";
import Vuex from "vuex";
import { ModelMap, Post } from "../../../src/models";
import store from "../../../src/store";
import { actions, getters, IPostState, mutations, mutCreate } from "../../../src/store_modules/PostService";

// import IPostState from "../../../src/store_modules/"
const { CREATE, DELETE } = mutations;

Vue.use(Vuex);

/* eslint-disable no-new */
const vueInstance = new Vue({
    el: "#app",
    // router,
    store,
    components: {},
    template: "<div/>"
});

function setup_state(): IPostState {
    const state = {
        posts: new ModelMap<Post>()
    };
    return state;
}

describe("[POST] CREATE should create a post", () => {
    it("should create one entry", () => {
        const s = setup_state();

        // sanity check
        expect(s).to.not.equal(undefined);
        for (let i = 0; i < 100; i++) {
            const newPost = new Post(i);
            CREATE(s, newPost);
        }
        const posts = s.posts as ModelMap<Post>;
        expect(posts.length).to.equal(100);
    });
});

describe("[POST] Delete", () => {
    it("should delete one entry", () => {
        const s = setup_state();

        // sanity check
        expect(s).to.not.equal(undefined);
        for (let i = 0; i < 100; i++) {
            const newPost = new Post(i);
            CREATE(s, newPost);
        }
        DELETE(s, 10);
        const posts = s.posts as ModelMap<Post>;
        expect(posts.length).to.equal(99);

        /* tslint:disable */
        expect(s.posts.get("10")).to.be.undefined;
        expect(s.posts.get(10)).to.be.undefined;
        /* tslint:enable */

        // attempt to delete already deleted...
        DELETE(s, "10");
        expect(s.posts.length).to.equal(99);
    });
});

// describe("[POST] Actions", () => {
//     it("fetchPost", () => {
//         const commit = sinon.spy();
//         const state = {};
//         actions.fetchPost(commit, state);
//     });
// });

describe("[POST] Getters", () => {
    it("all", () => {
        const state = setup_state();
        const out = new ModelMap<Post>();
        for (let i = 0; i < 100; i++) {
            const newPost = new Post(i);
            out.set(String(i), newPost);
            CREATE(state, newPost);
        }
        const result = getters.all(state);
        expect(result).to.deep.equal(out.list());
        expect(result.length).to.equal(100);
    });
    it("getPostById", () => {
        const state = setup_state();
        const out = new ModelMap<Post>();
        for (let i = 0; i < 100; i++) {
            const newPost = new Post(i);
            out.set(String(i), newPost);
            CREATE(state, newPost);
        }
        const result = getters.getPostById(state, getters)(10);
        expect(result).to.deep.equal(out.get("10"));
        expect(result).to.deep.equal(out.get(10));
    });
});
