import api from "../../api";
import Vue from "vue";
import axios from "axios";
import map from "lodash/map";
import forEach from "lodash/forEach";
import every from "lodash/every";
import reduce from "lodash/reduce";

// typescript 'require' workaround hack
declare function require(name:string);

// Load some necessary libraries
const uuidv4 = require("uuid/v4");

// FileService definition
const FileService = {
    state: {
        uploadedFiles: [],
        limit: 0,
        cancelSource: null
    },
    mutations: {
        UPDATE_UPLOAD_FILES: (state, data) => {
            map(state.uploadedFiles, val => {
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
            map(state.uploadedFiles, function (val, ind) {
                if (val.request_id === data.request_id) {
                    state.uploadedFiles.splice(ind, 1, data);
                    exists = true;
                }
            });
            if (!exists) {
                state.uploadedFiles.push(data);
            }
        },
        CANCEL_REQUEST: (state) => {
            if (state.cancelSource != null) {
                state.cancelSource.cancel("Operation cancelled by the user");
            }
        },
        REMOVE_FILE: (state, file) => {
            if (file.cancelSource != null) {
                file.cancelSource.cancel("Operation cancelled by the user");
            }
            let ind = state.uploadedFiles.indexOf(file);
            state.uploadedFiles.splice(ind, 1);
        },
        CHANGE_FILE_LIMIT: (state, data) => {
            state.limit = data;
        },
        CLEAR_UPLOADED_FILES: (state) => {
            state.uploadedFiles = [];
        },
        SET_CANCEL_TOKEN_SOURCE: (state, src) => {
            state.cancelSource = src;
        }
    },
    actions: {
        fileUpload: (context, formData) => {
            context.dispatch("saveDraft").then(function (postid) {
                var files = formData.getAll("files");
                var i = 0;
                forEach(files, function (file) {
                    var fileAlreadyUploaded = false;
                    context.state.uploadedFiles.forEach(function (element) {
                        if (element.file.name == file.name) {
                            fileAlreadyUploaded = true;
                        }
                    });
                    if (!fileAlreadyUploaded && i + context.state.uploadedFiles.length < context.state.limit) {
                        var identifier = uuidv4();
                        var cancelToken = axios.CancelToken;
                        var source = cancelToken.source();
                        let config = {
                            onUploadProgress: progressEvent => {
                                let percentCompleted = Math.floor(
                                    progressEvent.loaded * 100 / progressEvent.total
                                );
                                context.commit("CHANGE_UPLOADED_FILES", {
                                    percent: percentCompleted,
                                    file: file,
                                    request_id: identifier,
                                    cancelSource: source
                                });
                            },
                            cancelToken: source.token
                        };
                        api
                            .put(`upload/${file.name}?id=${identifier}&post=${context.rootGetters.getCurrentPostId}`, file, config)
                            .then(response => {
                                context.commit("UPDATE_UPLOAD_FILES", response);
                                context.commit("ADD_ATTACHMENT", response.data);
                            })
                            .catch(function (err) {
                                if (axios.isCancel(err)) {
                                    context.commit("REMOVE_FILE", file);
                                } else {
                                    console.error(err);
                                }
                            });
                    }
                    i++;
                });
            });
        },
        removeFile: (state, file) => {
            state.commit("CANCEL_REQUEST");
            state.commit("REMOVE_FILE", file);
        },
        changeFileLimit: (state, data) => {
            state.commit("CHANGE_FILE_LIMIT", data);
        },
        clearFiles: (state) => {
            state.commit("CLEAR_UPLOADED_FILES");
        }
    },
    getters: {
        filesUploadStatus: state => state.uploadedFiles,
        allFilesUploadComplete: (state) => {
            if (state.uploadedFiles.length > 0) {
                let oneHundredPercent = every(state.uploadedFiles, {"percent": 100});
                let hasURL = reduce(state.uploadedFiles, (res, val, key) => {
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
