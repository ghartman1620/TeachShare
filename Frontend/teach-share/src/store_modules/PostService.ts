import { AxiosResponse } from "axios";
import Vue from "vue";
import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import api from "../api";
import { IRootState, ModelMap, Post } from "../models";

// FIXME: change over to ModelMap<Post> so that it can be an associative map + an array.
export interface IPostState {
    posts: ModelMap<Post>;
}

type PostContext = ActionContext<IPostState, IRootState>;

const state = {
    // Post feed
    posts: new ModelMap<Post>()
};

export const actions = {
    postSearch: async (ctx: PostContext, query) => {
        // this code to generate a querystring is very bad but it is
        // 12:30AM and I do not care right now

        // also eslint needs to stop bitching
        // you're a code linter not a style guide you asshole
        console.log("in postSearch");
        let querystring = "";
        let firstProperty = true;
        Object.keys(query).forEach((key, index) => {
            if (firstProperty) {
                querystring += "?" + key + "=" + query[key];
                firstProperty = false;
            } else {
                querystring += "&" + key + "=" + query[key];
            }
        });
        console.log(querystring);
        try {
            const resp: AxiosResponse<Post[]> = await api.get("search/" + querystring);
            mutLoadAll(ctx, resp.data as Post[]);
        } catch (err) {
            console.error(err);
        }
    },
    fetchAllPosts: async (ctx: PostContext): Promise<Post[]|any> => {
        try {
            const resp: AxiosResponse<Post[]> = await api.get("search/");
            mutLoadAll(ctx, resp.data as Post[]);
            return resp.data;
        } catch (err) {
            return err;
        }
    },
    fetchAllPostsRaw: async (ctx: PostContext): Promise<Post[]|any> => {
        try {
            const resp: AxiosResponse<Post[]> = await api.get(`posts/?draft=False&page_size=5`);
            mutLoadAll(ctx, resp.data as Post[]);
            return resp.data;
        } catch (err) {
            return err;
        }
    },
    fetchPost: async (ctx: PostContext, postID: string|number) => {
        try {
            const resp: AxiosResponse<Post> = await api.get(`posts/${postID}/`);
            mutLoad(ctx, resp.data as Post);
            return resp.data;
        } catch (err) {
            return err;
        }
    },
    fetchFilteredPosts: async (ctx: PostContext, filterParams: string) => {
        try {
            const resp: AxiosResponse<Post[]> = await api.get(`posts/?user=${filterParams}`);
            mutLoadAll(ctx, resp.data as Post[]);
            return resp.data;
        } catch (err) {
            return err;
        }
    },
    updateExistingPost: async (ctx: PostContext, postObj: Post) => {
        try {
            const resp: AxiosResponse<Post> = await api.put(`posts/${postObj.pk}/`, postObj);
            console.log(resp);
            return resp.data;
        } catch (err) {
            if (err.response) {
                return err.response.data;
            } else if (err.request) {
                return err.request;
            } else {
                return err.message;
            }
        }
    },
    createPost: async (ctx: PostContext, post: Post) => {
        mutCreate(ctx, post);
    }
};

export const mutations = {
    LOAD_ALL_POSTS: (ctx, data: Post[]) => {
        ctx.posts = new ModelMap<Post>(...data);
    },
    // @FIXME: fix this to be functioning. Basically implement like other model backed
    // items..
    // alt_LOAD_ALL_POSTS: (ctx, data: Post[]) => {
    //     ctx.posts = data;
    // },

    CREATE: (ctx, data: Post) => {
        console.log("[POST]: ", ctx, data);
        const posts = ctx.posts as ModelMap<Post>;

        if (typeof data.pk !== "undefined") {
            if (!ctx.posts.has(data.pk)) {
                // @TODO: check if this actually works with vue reactivity.
                posts.set(String(data.pk), data);
                // Vue.set(ctx.posts.data, Number(data.pk), data);
            }
        }
    },
    UPDATE: (ctx, data: Post) => {
        if (typeof data.pk !== "undefined") {
            Vue.set(ctx.posts!.data, Number(data.pk), data);
        }
    },
    DELETE: (ctx: IPostState, data: number | string ) => {
        if (ctx.posts.has((data as string|number))) {
            console.log("it has it...");
            if (ctx.posts.remove(data)) {
                console.log("Successfully removed key.");
            }
        }
    },
    LOAD_POST: (ctx, data: Post) => {
        if (data !== undefined) {
            const index = ctx.posts.findIndex((val, ind, obj) => {
                if (val.pk === data.pk) {
                    return true;
                }
            });
            if (index === -1) {
                ctx.posts.push(data);
            } else {
                ctx.posts.splice(index, data);
            }
        }
    }
};

export const getters = {
    all: (ctx: IPostState) => ctx.posts.list(),
    getPostById: (ctx, gett) => (id): Post => {
        return gett.all(ctx).filter((post) => post.pk === Number(id))[0];
    }
};

const PostService = {
    strict: false, // process.env.NODE_ENV !== "production",
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
export default PostService;

/**
 * Type safe definitions for CommentService
 */
const { commit, read, dispatch } =
     getStoreAccessors<IPostState, IRootState>("post");

/**
 * Actions Handlers
 */
export const fetchAllPosts = dispatch(PostService.actions.fetchAllPosts);
export const fetchPost = dispatch(PostService.actions.fetchPost);
export const postSearch = dispatch(PostService.actions.postSearch);

/**
 * Getters Handlers
 */
export const getPosts = read(PostService.getters.all);
export const getPostById = read(PostService.getters.getPostById);

/**
 * Mutations Handlers
 */
export const mutDelete = commit(PostService.mutations.DELETE);
export const mutCreate = commit(PostService.mutations.CREATE);
export const mutLoadAll = commit(PostService.mutations.LOAD_ALL_POSTS);
export const mutLoad = commit(PostService.mutations.LOAD_POST);
