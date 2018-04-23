import { expect } from "chai";
import { ModelMap, Post } from "../../../src/models";
import { mutations } from "../../../src/store_modules/PostService";

console.log("MUTATIONS: ", Object.keys(mutations));
const { LOAD_ALL_POSTS, LOAD_POST } = mutations;

describe("[STORE] mutations", () => {
    it("LOAD_ALL_POSTS - empty", () => {
        // mock state
        const state = { posts: [] };
        // apply mutation
        LOAD_ALL_POSTS(state, []);
        // assert result

        let out = new ModelMap<Post>();

        expect(state.posts).to.eql(out);
        expect(typeof state.posts).to.equal("object");
    });
    it("LOAD_ALL_POSTS - nonempty", () => {
        // mock state
        const state = { posts: [] };

        const mm = new ModelMap<Post>();

        // apply mutation
        LOAD_ALL_POSTS(state, [{ pk: 1, content: {} } as Post]);
        // assert result
        mm.set("1", { pk: 1, content: {} } as Post);

        expect(state.posts).to.eql(mm);
        expect(state.posts.length).to.equal(1);
        expect(typeof state.posts).to.equal("object");

        LOAD_ALL_POSTS(state, [{ pk: 1, content: {} } as Post, { pk: 1, content: {} } as Post]);
        expect(state.posts).to.eql(mm);
        expect(state.posts.length).to.equal(2);
        expect(typeof state.posts).to.equal("object");
    });
    it("LOAD_POST - empty", () => {
        // mock state
        const state = { posts: [] };
        // apply mutation
        LOAD_POST(state, undefined);
        // assert result

        expect(state.posts).to.eql([]);
        expect(typeof state.posts).to.equal("object");
    });
    it("LOAD_POST - nonempty", () => {
        // mock state
        const state = { posts: [] };
        // apply mutation
        LOAD_POST(state, { pk: 1, content: {} });
        // assert result

        expect(state.posts).to.eql([{ pk: 1, content: {} }]);
        expect(state.posts.length).to.equal(1);
        expect(typeof state.posts).to.equal("object");

        LOAD_POST(state, { pk: 1, content: {} });
        expect(state.posts).to.eql([{ pk: 1, content: {} }]);
        expect(state.posts.length).to.equal(1);
        expect(typeof state.posts).to.equal("object");

        LOAD_POST(state, { pk: 2, content: {} });
        expect(state.posts).to.eql([
            { pk: 1, content: {} },
            { pk: 2, content: {} }
        ]);
        expect(state.posts.length).to.equal(2);
        expect(typeof state.posts).to.equal("object");
    });
});