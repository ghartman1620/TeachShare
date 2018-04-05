import { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import {
    mutations,
    getters,
    CommentState
} from "../../../src/store_modules/CommentService";
import { GenericFile, ModelMap, Comment, User } from "../../../src/models";

console.log("MUTATIONS: ", Object.keys(mutations));
const { CREATE, UPDATE, DELETE, CLEAR } = mutations;

function setup_state(): CommentState {
    const state: CommentState = {
        comments: new ModelMap<Comment>()
    };
    return state;
}

function generate_user(id?: number): User {
    if (typeof id === "undefined") {
        return new User(1);
    }
    return new User(id);
}

describe("[COMMENTS] create should create a comment", () => {
    it("should create one entry", () => {
        const state = setup_state();
        let comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        let out = {};
        out[comment.pk] = comment;

        CREATE(state, comment);
        let comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(1);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2)).to.be.false;
    });
    it("should create multiple comments", () => {
        const state = setup_state();
        let comment = new Comment(
            1,
            undefined,
            generate_user(1),
            "this is the post text..."
        );
        let comment2 = new Comment(
            2,
            undefined,
            generate_user(2),
            "this is different text"
        );
        let out = {};
        out[comment.pk] = comment;
        out[comment2.pk] = comment2;

        CREATE(state, comment);
        CREATE(state, comment2);

        let comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(2);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.get(2).pk).to.equal(2);
        expect(comments.has(1)).to.be.true;
        expect(comments.has(2)).to.be.true;
    });
});

describe("[COMMENTS] create should create a duplicate comment", () => {
    it("should create one entry", () => {
        const state = setup_state();
        let comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        let comment2 = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        let out = {};
        out[comment.pk] = comment;

        // create identical comments.
        CREATE(state, comment);
        CREATE(state, comment2);

        let comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(1);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2)).to.be.false;
    });
});

describe("[COMMENTS] update should update a comment", () => {
    it("should update one entry", () => {
        const state = setup_state();
        let comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        let comment2 = new Comment(
            2,
            undefined,
            generate_user(2),
            "this isn't the post text...? lulz"
        );
        let out = {};
        out[comment.pk] = comment;
        out[comment2.pk] = comment2;

        // create identical comments.
        CREATE(state, comment);
        CREATE(state, comment2);

        let comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(2);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2));
        expect(comments.has(3)).to.be.false;
        let testobj = { ...comment, text: "this is completely different now." };

        // that's the baseline ^^^^^^^
        UPDATE(state, testobj as Comment);

        let c = state.comments as ModelMap<Comment>;

        expect(c.get(1)).to.be.eql(testobj);
        expect(c.get(1).text).to.be.equal(testobj.text);
    });
});

describe("[COMMENTS] delete should delete a comment", () => {
    it("should update one entry", () => {
        const state = setup_state();
        let comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        let comment2 = new Comment(
            2,
            undefined,
            generate_user(2),
            "this isn't the post text...? lulz"
        );
        let out = {};
        out[comment.pk] = comment;
        out[comment2.pk] = comment2;

        // create identical comments.
        CREATE(state, comment);
        CREATE(state, comment2);

        let comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(2);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2));
        expect(comments.has(3)).to.be.false;
        let testobj = {
            ...comment,
            content: "this is completely different now."
        };

        // that's the baseline ^^^^^^^
        DELETE(state, comment2.pk);

        let c = state.comments as ModelMap<Comment>;
        expect(state.comments).length(1);
        let two: any = c.get(2);
        expect(two).to.be.undefined;
        let one: any = c.get(1);
        expect(one).to.be.eql(comment);
    });
});

describe("[COMMENTS] clear should clear all comment(s)", () => {
    it("should clear all entries", () => {
        const state = setup_state();
        let comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        let comment2 = new Comment(
            2,
            undefined,
            generate_user(2),
            "this isn't the post text...? lulz"
        );
        let out = {};
        out[comment.pk] = comment;
        out[comment2.pk] = comment2;

        // create identical comments.
        CREATE(state, comment);
        CREATE(state, comment2);

        let comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(2);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2));
        expect(comments.has(3)).to.be.false;
        let testobj = {
            ...comment,
            content: "this is completely different now."
        };

        // that's the baseline ^^^^^^^
        CLEAR(state);

        let c = state.comments as ModelMap<Comment>;
        expect(state.comments).length(0);
        let two: any = c.get(2);
        expect(two).to.be.undefined;
        let one: any = c.get(1);
        expect(one).to.be.undefined;
    });
});
