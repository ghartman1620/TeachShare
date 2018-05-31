import { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { Comment, GenericFile, ModelMap, User } from "../../../src/models";
import {
    CommentState,
    getters,
    mutations
} from "../../../src/store_modules/CommentService";

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
        const comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        const out = {};
        out[comment.pk] = comment;

        CREATE(state, comment);
        const comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(1);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2)).to.equal(false);
    });
    it("should create multiple comments", () => {
        const state = setup_state();
        const comment = new Comment(
            1,
            undefined,
            generate_user(1),
            "this is the post text..."
        );
        const comment2 = new Comment(
            2,
            undefined,
            generate_user(2),
            "this is different text"
        );
        const out = {};
        out[comment.pk] = comment;
        out[comment2.pk] = comment2;

        CREATE(state, comment);
        CREATE(state, comment2);

        const comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(2);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.get(2).pk).to.equal(2);
        expect(comments.has(1)).to.equal(true);
        expect(comments.has(2)).to.equal(true);
    });
});

describe("[COMMENTS] create should create a duplicate comment", () => {
    it("should create one entry", () => {
        const state = setup_state();
        const comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        const comment2 = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        const out = {};
        out[comment.pk] = comment;

        // create identical comments.
        CREATE(state, comment);
        CREATE(state, comment2);

        const comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(1);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2)).to.equal(false);
    });
});

describe("[COMMENTS] update should update a comment", () => {
    it("should update one entry", () => {
        const state = setup_state();
        const comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        const comment2 = new Comment(
            2,
            undefined,
            generate_user(2),
            "this isn't the post text...? lulz"
        );
        const out = {};
        out[comment.pk] = comment;
        out[comment2.pk] = comment2;

        // create identical comments.
        CREATE(state, comment);
        CREATE(state, comment2);

        const comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(2);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2));
        expect(comments.has(3)).to.equal(false);
        const testobj = { ...comment, text: "this is completely different now." };

        // that's the baseline ^^^^^^^
        UPDATE(state, testobj as Comment);

        const c = state.comments as ModelMap<Comment>;

        expect(c.get(1)).to.be.eql(testobj);
        expect(c.get(1).text).to.be.equal(testobj.text);
    });
});

describe("[COMMENTS] delete should delete a comment", () => {
    it("should update one entry", () => {
        const state = setup_state();
        const comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        const comment2 = new Comment(
            2,
            undefined,
            generate_user(2),
            "this isn't the post text...? lulz"
        );
        const out = {};
        out[comment.pk] = comment;
        out[comment2.pk] = comment2;

        // create identical comments.
        CREATE(state, comment);
        CREATE(state, comment2);

        const comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(2);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2));
        expect(comments.has(3)).to.equal(false);
        const testobj = {
            ...comment,
            content: "this is completely different now."
        };

        // that's the baseline ^^^^^^^
        DELETE(state, comment2.pk);

        const c = state.comments as ModelMap<Comment>;
        expect(state.comments).length(1);
        const two: any = c.get(2);
        expect(two).to.equal(undefined);
        const one: any = c.get(1);
        expect(one).to.be.eql(comment);
    });
});

describe("[COMMENTS] clear should clear all comment(s)", () => {
    it("should clear all entries", () => {
        const state = setup_state();
        const comment = new Comment(
            1,
            undefined,
            generate_user(),
            "this is the post text..."
        );
        const comment2 = new Comment(
            2,
            undefined,
            generate_user(2),
            "this isn't the post text...? lulz"
        );
        const out = {};
        out[comment.pk] = comment;
        out[comment2.pk] = comment2;

        // create identical comments.
        CREATE(state, comment);
        CREATE(state, comment2);

        const comments = state.comments as ModelMap<Comment>;
        expect(comments.data).to.eql(out as {});
        expect(comments.length).to.equal(2);
        expect(comments.get(1).pk).to.equal(1);
        expect(comments.has(1));
        expect(comments.has(2));
        expect(comments.has(3)).to.equal(false);
        const testobj = {
            ...comment,
            content: "this is completely different now."
        };

        // that's the baseline ^^^^^^^
        CLEAR(state);

        const c = state.comments as ModelMap<Comment>;
        expect(state.comments).length(0);
        const two: any = c.get(2);
        expect(two).to.equal(undefined);
        const one: any = c.get(1);
        expect(one).to.equal(undefined);
    });
});
