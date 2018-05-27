import { AxiosResponse } from "axios";
import Vue from "vue";
import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import api from "../api";
import { IRootState, ModelMap, Post } from "../models";

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
            return resp.data;
        } catch (err) {
            return err;
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

            if(typeof postID === "string"){
                postID = parseInt(postID);
            }
            console.log("awaiting Post.get with postid with type " + (typeof postID))
            var p: Post = await Post.get(postID as number);
            //const resp: AxiosResponse<Post> = await api.get(`posts/${postID}/`);
            mutCreate(ctx, p);
            return p;
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
    APPEND_MANY: (ctx, data: Post[]) => {
        for (const post of data) {
            mutCreate(ctx, post as Post);
        }
    },
    CREATE: (ctx, data: Post) => {
        const posts = ctx.posts as ModelMap<Post>;
        if (typeof data.pk !== "undefined") {
            if (!ctx.posts.has(data.pk)) {
                // @TODO: check if this actually works with vue reactivity.
                // posts.set(String(data.pk), data);
                console.log(data);
                Vue.set(ctx.posts.data, Number(data.pk), data);
            }
        }
    },
    UPDATE: (ctx, data: Post) => {
        const posts = ctx.posts as ModelMap<Post>;
        if (typeof data.pk !== "undefined") {
            posts.set(String(data.pk), data);
            // Vue.set(ctx.posts!.data, Number(data.pk), data);
        }
    },
    DELETE: (ctx: IPostState, data: number | string ) => {
        if (ctx.posts.has((data as string|number))) {
            if (!ctx.posts.remove(data)) {
                throw new Error("Error deleting key");
            }
        }
    }
};

export const getters = {
    allByPk: (ctx: IPostState) => ctx.posts.data,
    all: (ctx: IPostState): Post[] => ctx.posts.list(),
    getPostById: (ctx: IPostState, getters: any) => (id: string|number): Post => {
        return getters.all.find((post) => post.pk === Number(id));
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
export const mutUpdate = commit(PostService.mutations.UPDATE);
export const mutCreate = commit(PostService.mutations.CREATE);
export const mutLoadAll = commit(PostService.mutations.LOAD_ALL_POSTS);
