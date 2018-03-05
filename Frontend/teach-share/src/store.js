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
        posts: [],
        maximumPostIndex: 0
    },
    mutations: {
        ADD_POSTS: state => {
            api
                .get("posts/?beginIndex=" + state.maximumPostIndex)
                .then(response =>
                    response.data.forEach(function (post) {
                        state.posts.push(post);
                        state.maximumPostIndex++;
                    })
                )
                .catch(err => console.log(err));
        },
        LOAD_ALL_POSTS: (state, data) => {
            state.posts = Object.assign([], data);
        },
        LOAD_POST: (state, data) => {
            let index = state.posts.findIndex(function (val, ind, obj) {
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
            state.comments = Object.assign([], data);
        },
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
        addMorePosts: state => {
            state.commit("ADD_POSTS");
        },
        fetchAllPosts: (state, postID) => {
            console.log(api.defaults.headers.Authorization);
            api.get(`posts/`)
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
                .then(response => state.commit("LOAD_COMMENTS_FOR_POST", response.data))
                .catch(err => console.log(err));
        },
        fetchFilteredPosts: (state, filterParams) => {
            console.log("FETCH_FILTERED_POSTS", filterParams);
            api
                .get(`posts/?user=${filterParams}`)
                .then(response => state.commit("LOAD_FILTERED_POSTS", response.data))
                .catch(err => console.log(err));
        },
        createPost: (state, postObj) => {
            console.log(postObj);
            api
                .post("posts/", postObj)
                .then(response => console.log("post post success"))
                .catch(err => console.log(err));
        },
        login: (state, credentials) => {
            var body = {
                username: credentials.username,
                password: credentials.pw
            };
            var head = { headers: { "content-type": "application/json" } };
            api
                .post("get_token/", body, head)
                .then(response => state.commit("SET_TOKEN", response.data.token))
                .catch(err => console.log(err));
        }

    },
    getters: {
        getPosts: state => () => state.posts,
        getPostById: state => (id) => {
            return state.posts.filter(post => post.pk === Number(id))[0];
        }
    }
});