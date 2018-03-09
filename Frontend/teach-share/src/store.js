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

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        fs: FileService,
        yts: YouTubeService,
        video: VideoService,
        audio: AudioService,
        image: ImageService,
        create: PostCreateService,
        notifications: NotificationService
    },
    state: {
        user: null,
        comment: null,
        comments: [],

        token: null,
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
            let index = state.posts.findIndex(function(val, ind, obj) {
                console.log(ind, val, obj);
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
        LOAD_COMMENT: (state, data) => {
            state.comment = Object.assign({}, data);
        },
        LOAD_COMMENTS_FOR_POST: (state, data) => {
            console.log("PostID: ", data.post);
            console.log("Comments: ", data.comments);
            let index = state.posts.findIndex(val => val.pk === data.post);
            if (index !== -1) {
                state.posts[index].comments = Object.assign([], data.comments);
            }
            state.comments = Object.assign([], data);
        },
        CREATE_UPDATE_COMMENT: (state, comment) => {
            console.log("CREATE_COMMENT: ", comment);
            let postindex = state.posts.findIndex(
                val => val.pk === comment.post
            );
            if (postindex === -1) {
                console.log("it couldn't find it!");
            } else {
                let post = state.posts[postindex];
                let comments = post.comments;
                // comments.push(comment);
                console.log("Comments now... ", comments);
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
        // UPDATE_COMMENT: (state, comment) => {
        //     console.log("UPDATE_COMMENT: ", comment);
        //     let index = state.comments.findIndex(val => val.id === comment.id);
        //     console.log("update index: ", index);
        //     if (index === -1) {
        //         state.comments.push(comment);
        //         let postindex = state.posts.findIndex(val => val.pk === comment.post.pk);
        //         if (index === -1) {
        //             // what happened to the post
        //         } else {
        //             let commentindex = state.posts[postindex].comments.findIndex(val => val.pk === comment.pk);
        //             if (commentindex === -1) {
        //                 state.posts[postindex].comments.push(comment);
        //             } else {
        //                 state.posts[postindex].comments.splice(commentindex, comment);
        //             }
        //         }
        //     } else {
        //         state.comments.splice(index, 1);
        //     }
        // },
        LOAD_FILTERED_POSTS: (state, data) => {
            state.posts = Object.assign([], data);
        },
        SET_TOKEN: (state, tok) => {
            state.token = tok;
            console.log(state.token);
            api.defaults.headers.Authorization = "Token " + state.token;
            console.log(api.defaults.headers.Authorization);
        }
    },
    actions: {
        simplePostSearch: (state, term) => {
            console.log("doing search for" + term);
            api
                .get("search/?term=" + term)
                .then(response => state.commit("LOAD_ALL_POSTS", response.data))
                .catch(err => console.log(err));
        },
        fetchAllPosts: state => {
            console.log(api.defaults.headers.Authorization);
            api
                .get(`search/`)
                .then(response => state.commit("LOAD_ALL_POSTS", response.data))
                .catch(err => console.log(err));
        },
        fetchPost: (state, postID) => {
            console.log("FETCH_POST");
            console.log(api.defaults.headers.Authorization);
            api
                .get(`posts/${postID}/`)
                .then(response => state.commit("LOAD_POST", response.data))
                .catch(err => console.log(err));
        },
        fetchUser: (state, userID) => {
            console.log("FETCH_USER");
            api
                .get(`users/${userID}/`)
                .then(response => state.commit("LOAD_USER", response.data))
                .catch(err => console.log(err));
        },
        fetchComment: (state, commentID) => {
            console.log("FETCH_COMMENT");
            api
                .get(`comments/${commentID}/`)
                .then(response => state.commit("LOAD_COMMENT", response.data))
                .catch(err => console.log(err));
        },
        fetchComments: (state, commentID) => {
            console.log("FETCH_COMMENTS");
            api
                .get(`comments/${commentID}/`)
                .then(response => state.commit("LOAD_COMMENTS", response.data))
                .catch(err => console.log(err));
        },
        fetchCommentsForPost: (state, postID) => {
            console.log("FETCH_COMMENT");
            api
                .get(`comments/?post=${postID}`)
                .then(response =>
                    state.commit("LOAD_COMMENTS_FOR_POST", {
                        comments: response.data,
                        post: postID
                    })
                )
                .catch(err => console.log(err));
        },
        fetchFilteredPosts: (state, filterParams) => {
            console.log("FETCH_FILTERED_POSTS", filterParams);
            api
                .get(`posts/?user=${filterParams}`)
                .then(response =>
                    state.commit("LOAD_FILTERED_POSTS", response.data)
                )
                .catch(err => console.log(err));
        },
        createPost: (state, postObj) => {
            console.log(postObj);
            return new Promise((resolve, reject) => {
                api
                    .post("posts/", postObj)
                    .then(response => resolve(response))
                    .catch(function(error) {
                        console.log("error: ", error);
                        console.log(error.config);
                        if (error.response) {
                            // The request was made and the server responded with a status code
                            // that falls out of the range of 2xx
                            console.log(error.response.data);
                            console.log(error.response.status);
                            console.log(error.response.headers);
                            return resolve(error.response.data);
                        } else if (error.request) {
                            // The request was made but no response was received
                            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                            // http.ClientRequest in node.js
                            console.log(error.request);
                            return resolve(error.request);
                        } else {
                            // Something happened in setting up the request that triggered an Error
                            console.log("Error", error.message);
                            return resolve(error.message);
                        }
                    });
            });
        },
        saveDraft: (state, postObj) => {
            // var obj = {
            //     user: 1,
            //     title: this.title,
            //     content: this.$store.state.create.postElements,
            //     likes: 0,
            //     comments: [],
            //     tags: this.tags,
            //     attachments: []
            // };
            console.log(state);
            state.dispatch("createPost", "hey");
        },
        login: (state, credentials) => {
            var body = {
                username: credentials.username,
                password: credentials.pw
            };
            var head = { headers: { "content-type": "application/json" } };
            api
                .post("get_token/", body, head)
                .then(response =>
                    state.commit("SET_TOKEN", response.data.token)
                )
                .catch(err => console.log(err));
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
        }
    }
});