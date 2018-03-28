import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import { RootState, ModelMap, Comment } from "../../models";
import { CommentState } from "./state";
import api from "../../api";

type CommentContext = ActionContext<CommentState, RootState>;

const state = {
    comments: new ModelMap<Comment>(),
}

export const actions = {

    /**
     * FetchComments will fetch comments.
     */
    fetchComments: (state, commentID) => {
        api
            .get(`comments/${commentID}/`)
            .then(response => state.commit("LOAD_COMMENTS", response.data))
            .catch(err => console.error(err));
    },
    fetchCommentsForPost: (state, postID) => {
        return new Promise((resolve, reject) => {
            api
                .get(`comments/?post=${postID}`)
                .then(response => {
                    state.commit("LOAD_COMMENTS_FOR_POST", {
                        comments: response.data,
                        post: postID
                    });
                    resolve(response);
                })
                .catch(err => reject(err));
        });
    },
    /**
     * Fetch a comment with it's pk.
     */
    fetchComment: (state, commentID: number) => {
        api
            .get(`comments/${commentID}/`)
            .then(response => state.commit("LOAD_COMMENT", response.data))
            .catch(err => console.error(err));
    },
    createOrUpdateComment: (state, comment) => {
        if (comment.pk !== undefined) {
            return new Promise((resolve, reject) => {
                api
                    .put(`comments/${comment.pk}/`, comment)
                    .then(response => {
                        state.commit("CREATE_UPDATE_COMMENT", response.data);
                        return resolve(response);
                    })
                    .catch(err => reject(err));
            });
        } else {
            return new Promise((resolve, reject) => {
                api
                    .post("comments/", comment)
                    .then(response => {
                        state.commit("CREATE_UPDATE_COMMENT", response.data);
                        return resolve(response);
                    })
                    .catch(err => resolve(err.response.data));
            });
        }
    }
};

export const mutations = {

    // @TODO: finish this.
    // NOT FINISHED!
    CREATE: (state, data: Comment) => {
        state.comment = Object.assign({}, data);
    },
    FOR_POST: (state, data) => {
        let index = state.posts.findIndex(val => val.pk === data.post);
        if (index !== -1) {
            state.posts[index].comments = Object.assign([], data.comments);
        }
        state.comments = Object.assign([], data);
    },
    UPDATE: (state, comment) => {
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
    getCommentsByPost: (state, getters) => postid => {
        return getters.getPostById(postid).comments;
    }
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
