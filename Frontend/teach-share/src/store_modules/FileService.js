import api from "../api";
import Vue from "vue";

// Load some necessary libraries
const uuidv4 = require("uuid/v4");
var _ = require("lodash");

// FileService definition
const FileService = {
    state: {
        uploadedFiles: [],
        limit: 0
    },
    mutations: {
        UPDATE_UPLOAD_FILES: (state, data) => {
            _.map(state.uploadedFiles, val => {
                if (data.data.request_id === val.request_id) {
                    var res = Object.assign(val, {
                        db_id: data.data.id
                    });
                    var test = Vue.set(val, "url", data.data.url);
                }

            });
        },
        CHANGE_UPLOADED_FILES: (state, data) => {
            var exists = false;
            _.map(state.uploadedFiles, function(val, ind) {
                if (val.request_id === data.request_id) {
                    state.uploadedFiles.splice(ind, 1, data);
                    exists = true;
                }
            });
            if (!exists) {
                state.uploadedFiles.push(data);
                return;
            }
        },
        REMOVE_FILE: (state, file) => {
            console.log(file);
            let ind = state.uploadedFiles.indexOf(file);
            state.uploadedFiles.splice(ind, 1);
        },
        CHANGE_FILE_LIMIT: (state, data) => {
            state.limit = data;
        },
        CLEAR_UPLOADED_FILES: (state) => {
            state.uploadedFiles = [];
        }
    },
    actions: {
        fileUpload: (context, formData) => {
            var files = formData.getAll('files');
            console.log("in upload file");
            _.forEach(files, function(file) {
                var fileAlreadyUploaded = false;
                context.state.uploadedFiles.forEach(function(element){
                    if(element.file.name == file.name){
                        fileAlreadyUploaded = true;
                        return;
                    }
                });
                if(!fileAlreadyUploaded){
                    var identifier = uuidv4();
                    let config = {
                        onUploadProgress: progressEvent => {
                            let percentCompleted = Math.floor(
                                progressEvent.loaded * 100 / progressEvent.total
                            );
                            context.commit('CHANGE_UPLOADED_FILES', {
                                percent: percentCompleted,
                                file: file,
                                request_id: identifier
                            });
                        }
                    };
                    api
                        .put(`upload/${file.name}?id=${identifier}`, file, config)
                        .then(response => context.commit('UPDATE_UPLOAD_FILES', response))
                        .catch(err => console.log(err));
                }
            });
        },
        removeFile: (state, file) => {
            state.commit('REMOVE_FILE', file);
        },
        changeFileLimit: (state, data) => {
            console.log(data);
            state.commit('CHANGE_FILE_LIMIT', data);
        },
        clearFiles: (state) => {
            state.commit('CLEAR_UPLOADED_FILES');
        }
    },
    getters: {
        filesUploadStatus: state => state.uploadedFiles,
        allFilesUploadComplete: (state) => {
            if (state.uploadedFiles.length > 0) {
                let oneHundredPercent =  _.every(state.uploadedFiles, {'percent': 100});
                let hasURL = _.reduce(state.uploadedFiles, (res, val, key) => {
                    if (val.url !== undefined) {
                        return true;
                    }
                    return false;
                }, false);
                return oneHundredPercent === true && hasURL === true;
            }
            return false;
        },
        hasFiles: state => {
            return state.uploadedFiles.length > 0;
        },
        pastLimit: state => {
            return state.uploadedFiles.length >= state.limit;
        }
    }
};

export default FileService;