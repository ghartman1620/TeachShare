import Vue from 'vue';
import Vuex from 'vuex';
import api from '../src/api';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        post: null,
        user: null,
        comment: null,
        comments: [],
        posts: [],
        token: null,
        inProgressPostComponents: [],
        inProgressPostEditedComponentType: "",
    },
    mutations: {
        LOAD_POSTS: (state, data) => {
            state.posts = Object.assign([], data);
        },
        LOAD_POST: (state, data) => {
            state.post = Object.assign({}, data);
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
            console.log(api.defaults.headers.Authorization)
        },
        ADD_COMPONENT: (state, component) => {
            state.inProgressPostComponents.push(component);
            console.log('add component mutation');
        },
        CHANGE_EDITED_COMPONENT: (state, type) => {
            state.inProgressPostEditedComponentType = type;
            console.log('edited component mutation');
        }
    },
    actions: {
        fetchAllPosts: (state) => {
            console.log('FETCH_POSTS');
            api.get('posts/')
                .then(response => state.commit('LOAD_POSTS', response.data))
                .catch(err => console.log(err));
        },
        fetchPost: (state, postID) => {
            console.log('FETCH_POST');
            console.log(api.defaults.headers.Authorization);
            api.get(`posts/${postID}/`)
                .then(response => state.commit('LOAD_POST', response.data))
                .catch(err => console.log(err));
        },
        fetchUser: (state, userID) => {
            console.log('FETCH_USER');
            api.get(`users/${userID}/`)
                .then(response => state.commit('LOAD_USER', response.data))
                .catch(err => console.log(err));
        },
        fetchComment: (state, commentID) => {
            console.log('FETCH_COMMENT');
            api.get(`comments/${commentID}/`)
                .then(response => state.commit('LOAD_COMMENT', response.data))
                .catch(err => console.log(err));
        },
        fetchComments: (state, commentID) => {
            console.log('FETCH_COMMENTS');
            api.get(`comments/${commentID}/`)
                .then(response => state.commit('LOAD_COMMENTS', response.data))
                .catch(err => console.log(err));
        },
        fetchCommentsForPost: (state, postID) => {
            console.log('FETCH_COMMENT');
            api.get(`comments/?post=${postID}`)
                .then(response => state.commit('LOAD_COMMENTS_FOR_POST', response.data))
                .catch(err => console.log(err));
        },
        fetchFilteredPosts: (state, filterParams) => {
            console.log('FETCH_FILTERED_POSTS', filterParams);
            api.get(`posts/?user=${filterParams}`)
                .then(response => state.commit('LOAD_FILTERED_POSTS', response.data))
                .catch(err => console.log(err));
        },
        createPost: (state, postObj) => {
            console.log(JSON.stringify(postObj));
            api.post('posts/', postObj)
                .then(response => console.log('post post success'))
                .catch(err => console.log(err))
        },
        login: (state, credentials) => {
            var body = {
                'username': credentials.username,
                'password': credentials.pw
            };
            var head = { headers: { "content-type": "application/json" } };
            api.post('get_token/', body, head)
                .then(response => state.commit('SET_TOKEN', response.data.token))
                .catch(err => console.log(err));
        },
        addComponent: (state, component) => {
            state.commit('ADD_COMPONENT', component);
            console.log('add_component action');
        },
        changeEditedComponent: (state, type) => {
            state.commit('CHANGE_EDITED_COMPONENT', type);
            console.log('change edited component action');
        }
    }
})