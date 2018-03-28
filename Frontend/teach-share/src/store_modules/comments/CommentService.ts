import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import { RootState, ModelMap, Comment } from "../../models";
import { CommentState } from "./state";

type CommentContext = ActionContext<CommentState, RootState>;

const state = {
    comment: new Comment(),
    comments: new Array<Comment>(),
}

export const actions = {

};

export const mutations = {
    LOAD_COMMENT: (state, data) => {
        state.comment = Object.assign({}, data);
    },
    LOAD_COMMENTS_FOR_POST: (state, data) => {
        let index = state.posts.findIndex(val => val.pk === data.post);
        if (index !== -1) {
            state.posts[index].comments = Object.assign([], data.comments);
        }
        state.comments = Object.assign([], data);
    },
    CREATE_UPDATE_COMMENT: (state, comment) => {
        let postindex = state.posts.findIndex(val => val.pk === comment.post);
        if (postindex === -1) {
            console.error("Couldn't find it!", "danger");
        } else {
            let post = state.posts[postindex];
            let comments = post.comments;
            let commentindex = post.comments.findIndex(
                val => val.pk === comment.pk
            );
            if (commentindex === -1) {
                comments.push(comment);
                // Vue.$set(state.posts.postindex.comments, comments);
            } else {
                comments.splice(commentindex, comment);
                // Vue.$set(state.posts.postindex.comments, comments);
            }
        }
    }
};

export const getters = {

};

const CommentService = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};

export default CommentService;

/**
 * Type safe definitions for CommentService
 */
const { commit, read, dispatch } =
     getStoreAccessors<CommentState, RootState>("comment");
