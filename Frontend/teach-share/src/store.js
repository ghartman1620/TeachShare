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
        files: [],
        filesPercents: [],
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
        UPDATE_UPLOAD_FILES: (state, data) => {
            console.log(state, data);
            state.files.map((val, index, arr) => {
                var filename = data.data.filename.substring(data.data.filename.lastIndexOf('/') + 1, data.data.filename.length);
                console.log('filename from server: ', filename);
                console.log('file we have (url encoded): ', encodeURI(val.file.name));
                if (filename === encodeURI(val.file.name)) {
                    val = Object.assign(val, {
                        id: data.data.id,
                        url: data.data.url,
                        filename: filename
                    })
                }
            })
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
        CHANGE_UPLOADED_FILES: (state, data) => {
            var exists = false;
            state.files.map(function(val, ind) {
                console.log('VAL/IND: ', val, ind);
                if (val.file.name === data.file.name) {
                    console.log('data.file.name===', data);
                    state.files.splice(ind, 1, data);
                    exists = true;
                }
            })
            if (!exists) {
                state.files.push(data);
                return
            }
            console.log('EXISTS: ', exists);

            // state.filesPercents
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
            console.log(postObj);
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
        fileUpload: (state, { self, formData }) => {
            var files = formData.getAll('files')
            files.forEach(function(file) {
                console.log('Files: ', file);
                let config = {
                    onUploadProgress: progressEvent => {
                        let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
                        state.commit('CHANGE_UPLOADED_FILES', {
                            percent: percentCompleted,
                            file: file
                        });
                    }
                }
                api.put(`upload/${file.name}`, file, config)
                    .then(response => state.commit('UPDATE_UPLOAD_FILES', response))
                    // .then(response => state.commit('SET_FILES', response.data))
                    .catch(err => console.log(err));
            });
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
    getters: {
        filesUploadStatus: state => state.files,
        // allFilesUploadComplete: state => {
        //     console.log('allUploadFinished');
        //     for (var obj in state.filesPercents.keys()) {
        //         console.log('OBJECT: ', key, obj);
        //     }
        // }
    }
})