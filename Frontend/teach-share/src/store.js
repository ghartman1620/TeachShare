import Vue from 'vue';
import Vuex from 'vuex';
import api from '../src/api';
import FileService from './store_modules/FileService';
import YouTubeService from './store_modules/YouTubeService';
import VideoService from './store_modules/VideoService';
import AudioService from './store_modules/AudioService';
import ImageService from './store_modules/ImageService';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        fs: FileService,
        yts: YouTubeService,
        video: VideoService,
        audio: AudioService,
        image: ImageService
    },
    state: {
        user: null,
        inProgressPostComponents: [],
        inProgressPostEditedComponentType: '',
        postOpacity: { opacity: 1 }
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

        // Mutations for the currently edited post data: inProgressEditedComponentType and inProgressPostComponents
        ADD_COMPONENT: (state, component) => {
            console.log(state.inProgressPostComponents);
            state.inProgressPostComponents.push(component);
            console.log(state.inProgressPostComponents);
            console.log('add component mutation');
        },
        CHANGE_EDITED_COMPONENT: (state, type) => {
            state.inProgressPostEditedComponentType = type;
            console.log('edited component mutation');
            if (state.postOpacity.opacity == 1) {
                state.postOpacity.opacity = .3;
            } else {
                state.postOpacity.opacity = 1;
            }
        },
        SWAP_COMPONENTS: (state, iAndJ) => {
            // I wrote this code because i'm triggered by being limited
            // to one function argument so I'm going to pretend I can pass two.
            var i = iAndJ[0];
            var j = iAndJ[1];
            var tmp = state.inProgressPostComponents[i];
            Vue.set(state.inProgressPostComponents,
                i, state.inProgressPostComponents[j]);
            Vue.set(state.inProgressPostComponents,
                j, tmp);
            console.log(state.inProgressPostComponents);
        },
        REMOVE_COMPONENT: (state, index) => {
            state.inProgressPostComponents.splice(index, 1);
        },
        EDIT_COMPONENT: (state, editedComponent) => {
            state.inProgressPostComponents.splice(editedComponent.index, 1, editedComponent.component);
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
            var head = { headers: { 'content-type': 'application/json' } };
            api.post('get_token/', body, head)
                .then(response => state.commit('SET_TOKEN', response.data.token))
                .catch(err => console.log(err));
        },

        // Actions for in progress posts
        addComponent: (state, component) => {
            console.log('add_component action');
            state.commit('ADD_COMPONENT', component);
        },
        changeEditedComponent: (state, type) => {
            console.log('change edited component action');
            state.commit('CHANGE_EDITED_COMPONENT', type);
        },
        // Actions are only allowed to have one argument so iAndJ is
        // a list with index 0 as the first index to be swapped
        // and index 1 the second
        swapComponents: (state, iAndJ) => {
            console.log(iAndJ[0] + ' ' + iAndJ[1]);
            state.commit('SWAP_COMPONENTS', iAndJ);
        },
        removeComponent: (state, index) => {
            state.commit('REMOVE_COMPONENT', index);
        },
        editComponent: (state, editedComponent) => {
            state.commit('EDIT_COMPONENT', editedComponent);
        }
    },
    getters: {}
})