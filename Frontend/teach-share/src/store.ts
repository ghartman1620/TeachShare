import { AxiosResponse } from "axios";
import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";

import api from "../src/api";
import { IRootState, Post, User } from "./models";
import CommentService from "./store_modules/CommentService";
import FileService from "./store_modules/FileService";
import NotificationService from "./store_modules/NotificationService";
import PostCreateService from "./store_modules/PostCreateService";
import UserService from "./store_modules/UserService";
import YouTubeService from "./store_modules/YouTubeService";

Vue.use(Vuex);

export const mutations = {
    LOAD_ALL_POSTS: (state, data) => {
        console.log("loading all posts...");
        console.log(data);
        state.posts = data;
    },
    LOAD_POST: (state: IRootState, data: Post) => {
        if (data !== undefined) {
            let index = state.posts.findIndex(function(val: Post, ind: number, obj: Post[]) {
                if (val.pk === data.pk) {
                    return <boolean>true;
                }
                return <boolean>false;
            });
            if (index === -1) {
                state.posts.push(data);
            } else {
                state.posts.splice(index, 1, data);
            }
        }
    },
    LOAD_USER: (state, data) => {
        state.user = Object.assign({}, data);
    },
    ADD_USER: (state, user: User) => {
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
    fetchAllPosts: ctx => {
        console.log("feteching all posts in store");
        api
            .get(`search/`)
            .then(function(response) {
                console.log(response);
                ctx.commit("LOAD_ALL_POSTS", response.data)
            })
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
    fetchUser: async (state, userID: number) => {
        try {
            let resp: AxiosResponse = await api.get(`users/${userID}/`);
            state.commit("ADD_USER", resp.data);
            return resp.data
        } catch (err) {
            console.log(err);
            return err
        }
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
    },
    getUsers: state => {
        return state.users;
    }
};

const store: StoreOptions<IRootState> = {
    state: {
        user: new User(),
        users: new Array<User>(),

        // Post feed
        posts: new Array<Post>()
    },
    modules: {
        fs: FileService,
        yt: YouTubeService,
        create: PostCreateService,
        notify: NotificationService,
        comment: CommentService,
        user: UserService
    },
    mutations,
    actions,
    getters
};
export default new Vuex.Store<IRootState>(store);
