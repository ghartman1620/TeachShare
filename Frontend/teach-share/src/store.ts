import Vue from "vue";
// import Vuex, { GetterTree } from "vuex";
import Vuex, { StoreOptions } from 'vuex';

import api from "../src/api";
import FileService from "./store_modules/files/FileService";
import YouTubeService from "./store_modules/YouTubeService";
import PostCreateService from "./store_modules/PostCreateService";
import UserService from "./store_modules/UserService";
import CommentService from "./store_modules/comments/CommentService";
import NotificationService from "./store_modules/notify/NotificationService";

import { RootState } from "./models";
import { Post, Comment, User } from "./models";

Vue.use(Vuex);

export const mutations = {
    LOAD_ALL_POSTS: (state, data) => {
        state.posts = data;
    },
    LOAD_POST: (state, data) => {
        if (data !== undefined) {
            let index = state.posts.findIndex(function(val, ind, obj) {
                if (val.pk === data.pk) {
                    return true;
                }
            });
            if (index === -1) {
                state.posts.push(data);
            } else {
                state.posts.splice(index, data);
            }
        }
    },
    LOAD_USER: (state, data) => {
        state.user = Object.assign({}, data);
    },
    ADD_USER: (state, user) => {
        console.log("ADDUSER: ", user);
        let index = state.users.findIndex(val => val.pk === user.pk);
        console.log(index);
        if (index !== -1) {
            state.users.splice(index, user);
            console.log(state.users);
            return;
        }
        state.users.push(user);
        console.log(state.users);
    },
    LOAD_FILTERED_POSTS: (state, data) => {
        state.posts = Object.assign([], data);
    }
};

export const actions = {
    postSearch: (state, query) => {
        // this code to generate a querystring is very bad but it is
        // 12:30AM and I do not care right now

        // also eslint needs to stop bitching
        // you're a code linter not a style guide you asshole
        console.log("in postSearch");
        var querystring = "";
        var firstProperty = true;
        Object.keys(query).forEach(function(key, index) {
            if (firstProperty) {
                querystring += "?" + key + "=" + query[key];
                firstProperty = false;
            } else {
                querystring += "&" + key + "=" + query[key];
            }
        });
        console.log(querystring);
        api
            .get("search/" + querystring)
            .then(response => state.commit("LOAD_ALL_POSTS", response.data))
            .catch(err => console.error(err));
    },
    fetchAllPosts: state => {
        api
            .get(`search/`)
            .then(response => state.commit("LOAD_ALL_POSTS", response.data))
            .catch(err => console.error(err));
    },
    fetchAllPostsRaw: state => {
        console.log("fetchAllPostsRaw");
        api
            .get(`posts/?draft=False&page_size=5`)
            .then(response => {
                state.commit("LOAD_ALL_POSTS", response.data.results);
                console.log(response);
            })
            .catch(err => console.error(err));
    },
    fetchPost: (state, postID) => {
        return new Promise((resolve, reject) => {
            api
                .get(`posts/${postID}/`)
                .then(response => {
                    state.commit("LOAD_POST", response.data);
                    resolve(response.data);
                })
                .catch(err => console.error(err));
        });
    },
    fetchUser: (state, userID) => {
        api
            .get(`users/${userID}/`)
            .then(response => state.commit("ADD_USER", response.data))
            .catch(err => console.error(err));
    },

    /**
     * This is some text to test something. Below should have one type for user.
     */
    addUser: (state, user) => {
        state.commit("ADD_USER", user);
    },
    fetchFilteredPosts: (state, filterParams) => {
        api
            .get(`posts/?user=${filterParams}`)
            .then(response =>
                state.commit("LOAD_FILTERED_POSTS", response.data)
            )
            .catch(err => console.error(err));
    },
    createPost: (state, postObj) => {
        return new Promise((resolve, reject) => {
            api
                .post("posts/", postObj)
                .then(response => resolve(response))
                .catch(function(error) {
                    if (error.response) {
                        return resolve(error.response.data);
                    } else if (error.request) {
                        return resolve(error.request);
                    } else {
                        return resolve(error.message);
                    }
                });
        });
    },
    updateExistingPost: (state, postObj) => {
        return new Promise((resolve, reject) => {
            api
                .put(`posts/${postObj.pk}/`, postObj)
                .then(response => resolve(response))
                .catch(function(error) {
                    if (error.response) {
                        return resolve(error.response.data);
                    } else if (error.request) {
                        return resolve(error.request);
                    } else {
                        return resolve(error.message);
                    }
                });
        });
    },
    saveDraft: ctx => {
        console.log("CALLING SAVE DRAFT!!!");
        if (ctx.rootGetters.getCurrentPostId === null) {
            // hasn't yet been saved...
            var obj = {
                user: ctx.rootGetters.getCurrentUser.profile.pk,
                title: ctx.rootGetters.getTitle,
                content: ctx.rootGetters.getContent,
                likes: 0,
                comments: [],
                tags: ctx.rootGetters.getTags,
                attachments: [],
                content_type: 0,
                grade: 0,
                length: 0
            };
            return ctx.dispatch("createPost", obj).then(result => {
                ctx.dispatch("setCurrentPost", result.data);
                return result.data.pk;
            });
        } else {
            // might be redundant! Check.
            var currentPost = ctx.rootGetters.getCurrentPost;
            currentPost.content = ctx.state.create.postElements;
            currentPost.user = ctx.rootGetters.getCurrentUser.profile.pk;
            currentPost.tags = ctx.rootGetters.getTags;
            currentPost.title = ctx.rootGetters.getTitle;

            return ctx.dispatch("updateExistingPost", currentPost).then(res => {
                return ctx.dispatch("setCurrentPost", res.data);
            });
        }
    }
};

export const getters = {
    getPosts: state => () => state.posts,
    getPostById: state => id => {
        return state.posts.filter(post => post.pk === Number(id))[0];
    },
    getCurrentUser: (state, getters) => {
        return state.user;
    },
    getUserByID: state => id => {
        return state.users.find((val, ind, obj) => val.pk === id);
    }
};

const store: StoreOptions<RootState> = {
    state: {
        user: new User(),
        users: new Array<User>(),

        // Post feed
        posts: new Array<Post>()
    },
    modules: {
        fs: FileService,
        yts: YouTubeService,
        create: PostCreateService,
        notify: NotificationService,
        comment: CommentService,
        user: UserService
    },
    mutations,
    actions,
    getters
}
export default new Vuex.Store<RootState>(store);
