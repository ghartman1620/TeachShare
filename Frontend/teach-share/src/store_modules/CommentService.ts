import Vue from "vue";
import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import api from "../api";
import { Comment, IRootState, ModelMap } from "../models";

export interface CommentState {
    comments?: ModelMap<Comment>;
}

type CommentContext = ActionContext<CommentState, IRootState>;

const state = {
    comments: new ModelMap<Comment>()
};

export const actions = {
    /**
     * FetchAllComments will fetch comments.
     */
    getAll: async ctx => {
        try {
            let response = await api.get(`comments/`);
            ctx.commit("LOAD_COMMENTS", response.data);
        } catch (err) {
            console.error(err);
        }
    },

    /**
     * getByPost - get's all comments for a post, but the
     * posts primary key.
     *
     * @param  {} ctx
     * @param  {number} postID
     */
    getByPost: async (ctx, postID: number) => {
        try {
            let response = await api.get(`comments/?post=${postID}`);
            console.log(response.data);
            for (let c of response.data) {
                console.log(c);
                mutUpdate(ctx, c);
            }
            // mutCreate(ctx, );
            return response;
        } catch (err) {
            return err;
        }
    },

    /**
     * Fetch a comment with it's pk.
     */
    getComment: (state, commentID: number) => {
        api
            .get(`comments/${commentID}/`)
            .then(response => state.commit("UPDATE", response.data))
            .catch(err => console.error(err));
    },
    createUpdate: async (state, comment: Comment) => {
        if (typeof comment.pk === "undefined") {
            try {
                let response = await api.put(
                    `comments/${comment.pk}/`,
                    comment
                );
                state.commit("CREATE", response.data);
                return response;
            } catch (err) {
                console.log(err);
                return err;
            }
        } else {
            try {
                let response = await api.post("comments/", comment);
                state.commit("UPDATE", response.data);
                return response;
            } catch (err) {
                console.log(err);
                console.log(err.response.data);
                return err;
            }
        }
    }
};

export const mutations = {
    /**
     * CREATE - mutation to create a comment and save it into the store.
     * will ignore duplicates. If you want to be able to create-or-update,
     * just use UPDATE, which will do either.
     *
     * @param  {} state
     * @param  {Comment} comment
     */
    CREATE: (state, comment: Comment) => {
        let c = state.comments as ModelMap<Comment>;
        if (typeof comment.pk === "undefined" || !c.has(comment.pk)) {
            Vue.set(state.comments.data, String(comment.pk), comment);
        }
    },

    /**
     * UPDATE - mutation for update. Also will create. The difference being
     * that using a create-or-update for certain things can hide bugs by covering
     * up errors. This way lets you code based on your truest intention.
     *
     * @param  {} state
     * @param  {Comment} comment
     */
    UPDATE: (state, comment: Comment) => {
        Vue.set(state.comments.data, String(comment.pk), comment);
    },

    /**
     * DELETE - mutation for deleting a comment from the associative array.
     *
     * @param  {} state
     * @param  {number|string} commentid
     */
    DELETE: (state, commentid: number | string) => {
        Vue.delete(state.comments.data, String(commentid));
    },

    /**
     * CLEAR - completely clears out all comments.
     *
     * @param  {} state
     */
    CLEAR: state => {
        state.comments = new ModelMap<Comment>();
    }
};

export const getters = {
    /**
     * loadedComments: is the base list of comments. It takes the associative
     * 'dictionary' type value and flattens it into a list that is easy to manipulate
     * like a list for eg. filter, reduce, etc...
     *
     * @param  {} state
     * @returns Comment[]
     */
    loadedComments: (state): Comment[] => {
        let comments: Comment[] = [];
        for (let c of state.comments) {
            console.log(c);
            comments.push(c);
        }
        return comments;
    },

    /**
     * getCommentsForPost: is the basic function for getting a list of just the comments
     * related to a particular post id that are already loaded in the store.
     *
     * @param  {} state
     * @param  {} getters
     * @param  {number} => (postid)
     * @returns Comment[]
     */
    getCommentsForPost: (state, getters) => (postid: number): Comment[] => {
        return getters.loadedComments.filter(
            comment => comment.post === postid
        );
    }
};

const CommentService = {
    namespaced: true,
    strict: process.env.NODE_ENV !== "production",
    state,
    mutations,
    actions,
    getters
};

export default CommentService;

/**
 * Type safe definitions for CommentService
 */
const { commit, read, dispatch } = getStoreAccessors<CommentState, IRootState>(
    "comment"
);

/**
 * Actions Handlers
 */
export const createUpdateComment = dispatch(
    CommentService.actions.createUpdate
);
export const getByPost = dispatch(CommentService.actions.getByPost);
/**
 * Getters Handlers
 */
export const getCommentsForPost = read(
    CommentService.getters.getCommentsForPost
);

/**
 * Mutations Handlers
 */
export const mutCreate = commit(CommentService.mutations.CREATE);
export const mutUpdate = commit(CommentService.mutations.UPDATE);
export const mutDelete = commit(CommentService.mutations.DELETE);
export const mutClear = commit(CommentService.mutations.CLEAR);
