import Vue from "vue";
import Vuex from "vuex";
import api from "../src/api";
import FileService from "./store_modules/FileService";
import YouTubeService from "./store_modules/YouTubeService";
import VideoService from "./store_modules/VideoService";
import AudioService from "./store_modules/AudioService";
import ImageService from "./store_modules/ImageService";
import PostCreateService from "./store_modules/PostCreateService";
import NotificationService from "./store_modules/NotificationService";
import UserService from "./store_modules/UserService";
import $log from "./log";

Vue.use(Vuex);

export default new Vuex.Store({
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
    state: {
        user: null,
        comment: null,
        comments: [],
        users: [],

        // file upload
        files: [],
        filesPercents: [],

        // Post feed
        posts: []
    },
    mutations: {
        LOAD_ALL_POSTS: (state, data) => {
            state.posts = Object.assign([], data);
        },
        LOAD_POST: (state, data) => {
            let index = state.posts.findIndex(function (val, ind, obj) {
                if (val === data) {
                    return true;
                }
            });
            if (index === -1) {
                state.posts.push(data);
            } else {
                state.posts[index] = data;
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
            let postindex = state.posts.findIndex(
                val => val.pk === comment.post
            );
            if (postindex === -1) {
                $log("Couldn't find it!", "danger");
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

    },
    actions: {
        postSearch: (state, query) => {
            // this code to generate a querystring is very bad but it is
            // 12:30AM and I do not care right now

            // also eslint needs to stop bitching
            // you're a code linter not a style guide you asshole
            console.log("in postSearch");
            var querystring = "";
            var firstProperty = true;
            Object.keys(query).forEach(function (key, index) {
                if (firstProperty) {
                    querystring += "?" + key + "=" + query[key];
                    firstProperty = false;
                } else {
                    querystring += "&" + key + "=" + query[key];
                }
            });
            console.log(querystring);
            api.get("search/" + querystring)
                .then(response => state.commit("LOAD_ALL_POSTS", response.data))
                .catch(err => $log(err));
        },
        fetchAllPosts: state => {
            api
                .get(`search/`)
                .then(response => state.commit("LOAD_ALL_POSTS", response.data))
                .catch(err => $log(err));
        },
        fetchAllPostsRaw: state => {
            console.log("fetchAllPostsRaw");
            api
                .get(`posts/?draft=False&page_size=5`)
                .then(response => {
                    state.commit("LOAD_ALL_POSTS", response.data.results);
                    console.log(response);
                })
                .catch(err => $log(err));
        },
        fetchPost: (state, postID) => {
            return new Promise((resolve, reject) => {
                api
                    .get(`posts/${postID}/`)
                    .then(response => {
                        state.commit("LOAD_POST", response.data);
                        resolve(response.data);
                    })
                    .catch(err => $log(err));
            });
        },
        fetchUser: (state, userID) => {
            api
                .get(`users/${userID}/`)
                .then(response => state.commit("ADD_USER", response.data))
                .catch(err => $log(err));
        },
        addUser: (state, user) => {
            state.commit("ADD_USER", user);
        },
        fetchComment: (state, commentID) => {
            api
                .get(`comments/${commentID}/`)
                .then(response => state.commit("LOAD_COMMENT", response.data))
                .catch(err => $log(err));
        },
        fetchComments: (state, commentID) => {
            $log("FETCH_COMMENTS");
            api
                .get(`comments/${commentID}/`)
                .then(response => state.commit("LOAD_COMMENTS", response.data))
                .catch(err => $log(err));
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
                .catch(err => $log(err));
        },
        createPost: (state, postObj) => {
            return new Promise((resolve, reject) => {
                api
                    .post("posts/", postObj)
                    .then(response => resolve(response))
                    .catch(function (error) {
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
                    .catch(function (error) {
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
        saveDraft: (ctx) => {
            if (ctx.rootGetters.getCurrentPostId === null) { // hasn't yet been saved...
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
                return ctx.dispatch("createPost", obj).then((result) => {
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
        },
        createOrUpdateComment: (state, comment) => {
            if (comment.pk !== undefined) {
                return new Promise((resolve, reject) => {
                    api
                        .put(`comments/${comment.pk}/`, comment)
                        .then(response => {
                            state.commit(
                                "CREATE_UPDATE_COMMENT",
                                response.data
                            );
                            return resolve(response);
                        })
                        .catch(err => reject(err));
                });
            } else {
                return new Promise((resolve, reject) => {
                    api
                        .post("comments/", comment)
                        .then(response => {
                            state.commit(
                                "CREATE_UPDATE_COMMENT",
                                response.data
                            );
                            return resolve(response);
                        })
                        .catch(err => resolve(err.response.data));
                });
            }
        }
    },
    getters: {
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
        }
    }
});