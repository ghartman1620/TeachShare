import Vue from "vue";
// import Vuex, { GetterTree } from "vuex";
import Vuex, { StoreOptions } from 'vuex';

import api from "../src/api";
import FileService from "./store_modules/file/FileService";
import YouTubeService from "./store_modules/YouTubeService";
import VideoService from "./store_modules/VideoService";
import AudioService from "./store_modules/audio/AudioService";
import ImageService from "./store_modules/ImageService";
import PostCreateService from "./store_modules/PostCreateService";
import NotificationService from "./store_modules/NotificationService";
import UserService from "./store_modules/UserService";

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

    /**
     * Fetch a comment with it's pk.
     */
    fetchComment: (state, commentID: number) => {
        api
            .get(`comments/${commentID}/`)
            .then(response => state.commit("LOAD_COMMENT", response.data))
            .catch(err => console.error(err));
    },

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
    getCommentsByPost: (state, getters) => postid => {
        return getters.getPostById(postid).comments;
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

const store: StoreOptions<RootState> = {
    state: {
        user: new User(),
        comment: new Comment(),
        comments: new Array<Comment>(),
        users: new Array<User>(),

        // file upload
        files: new Array<any>(),
        filesPercents: new Array<any>(),

        // Post feed
        posts: new Array<Post>()
    },
    modules: {
        fs: FileService,
        yts: YouTubeService,
        video: VideoService,
        audio: AudioService,
        image: ImageService,
        create: PostCreateService,
        notifications: NotificationService,
        user: UserService
    },
    mutations,
    actions,
    getters
}
export default new Vuex.Store<RootState>(store);
