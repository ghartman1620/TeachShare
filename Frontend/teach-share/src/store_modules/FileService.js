import api from '../api';
import Vue from 'vue';

// Load some necessary libraries
const uuidv4 = require('uuid/v4');
var _ = require('lodash');

// FileService definition
const FileService = {
    state: {
        files: []
    },
    mutations: {
        UPDATE_UPLOAD_FILES: (state, data) => {
            _.map(state.files, val => {
                if (data.data.request_id === val.request_id) {
                    var res = Object.assign(val, {
                        db_id: data.data.id,
                    });
                    var test = Vue.set(val, 'url', data.data.url);
                }
            })
        },
        CHANGE_UPLOADED_FILES: (state, data) => {
            var exists = false;
            _.map(state.files, function(val, ind) {
                if (val.request_id === data.request_id) {
                    state.files.splice(ind, 1, data);
                    exists = true;
                }
            });
            if (!exists) {
                state.files.push(data);
                return;
            }
        },
    },
    actions: {
        fileUpload: (state, formData) => {
            var files = formData.getAll('files')
            _.forEach(files, function(file) {
                var identifier = uuidv4()
                let config = {
                    onUploadProgress: progressEvent => {
                        let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
                        state.commit('CHANGE_UPLOADED_FILES', {
                            percent: percentCompleted,
                            file: file,
                            request_id: identifier
                        });
                    }
                }
                api.put(`upload/${file.name}?id=${identifier}`, file, config)
                    .then(response => state.commit('UPDATE_UPLOAD_FILES', response))
                    .catch(err => console.log(err));
            });
        },
    },
    getters: {
        filesUploadStatus: state => state.files,
        allFilesUploadComplete: (state, getters, rootState) => {
            var res = _.filter(state.files, val => {
                return val.percent === 100;
            })
            return res.length === state.files.length;
        }
    }
}

export default FileService;