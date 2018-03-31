import api from "../../api";
import Vue from "vue";
import axios from "axios";
import map from "lodash/map";
import forEach from "lodash/forEach";
import every from "lodash/every";
import reduce from "lodash/reduce";

import { RootState, GenericFile, ModelMap } from "../../models";
import { FileState } from "./state";
import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

type FileContext = ActionContext<FileState, RootState>;

/**
 * The state for file uploads, other file operations.
 */
const state: FileState = {
    files: new ModelMap<GenericFile>(),
    limit: 0
}

// typescript 'require' workaround hack
declare function require(name: string);

// Load some necessary libraries
const uuidv4 = require("uuid/v4");

/**
 * Actions - file_upload, remove_file, change_limit, and clear_files.
 */

/**
 * file_upload - for handling file uploads.
 *
 * @TODO: Simplify/break up
 */
export const file_upload =  async (context: FileContext, files) => {
    console.log(context, files);
    try {
        let postid = await context.dispatch("saveDraft", null, {root: true});
        console.log(postid);
    } catch (err) {
        console.log(err);
    }

    let i: number = 0;
    var uploadedFiles: ModelMap<GenericFile> = <ModelMap<GenericFile>>context.state.files;
    files.forEach( async (file) => {
        let fileAlreadyUploaded = false;

        for(let element of uploadedFiles) {
            /**
             * @changed: ==, ===
             * Test whether or not a file is already uploaded.
             */
            if (element!.file!.name === file.name) {
                fileAlreadyUploaded = true;
            }
        }
        if (!fileAlreadyUploaded && i + uploadedFiles.length < context.state.limit) {
            console.log("in uploading files");
            let id = uuidv4();
            let cancelToken = axios.CancelToken;
            let cancel = cancelToken.source();
            let config = {
                onUploadProgress: progressEvent => {
                    let percent = Math.floor(
                        progressEvent.loaded * 100 / progressEvent.total
                    );
                    console.log(new GenericFile(id, percent, file, cancel));
                    context.commit("create_update_file", new GenericFile(id, percent, file, cancel));
                },
                cancelToken: cancel.token
            };
            try {
                /**
                 * make request
                 */
                console.log("make request");
                let response = await api
                    .put(`upload/${file.name}?id=${id}&post=${context.getters.getCurrentPostId}`,
                        file, config)
                console.log(response);
                // update the current uploaded file object
                context.commit("create_update_file", new GenericFile(id, 100, file, undefined, response.data.url));

            } catch ( error ) {
                /**
                 * Uh-oh! there was an error in the axios request, while
                 * attempting to upload the file.
                 */
                console.log(error);
                if (axios.isCancel(error)) {
                    context.commit("delete_file", file);
                } else {
                    console.error(error);
                }
            }
        }
        i++; // increment file count
    });
}

export const actions = {
    file_upload,
    remove_file: (state, file) => {
        state.commit("delete_file", file);
    },
    change_limit: (state, data) => {
        state.commit("change_limit", data);
    },
    clear_files: (state, data) => {
        state.commit("clear_files");
    }
}

/**
 * Mutations - Handles CRUD operations, as well as file upload
 * limits and completely clearing files.
 */
export const mutations = {

    /**
     * create_file will create a file. It will NOT replace
     * a file with the same key. Use update for that.
     */
    create_file: (state, data: GenericFile) => {
        if (typeof data.pk !== "undefined") {
            if (!state.files.data.hasOwnProperty(data.pk)) {
                Vue.set(state.files.data, data.pk, data);
            }
        }
    },

    /**
     * create_update_file will primarily update a file.
     * but will also create files that don't already exist.
     */
    create_update_file: (state, data: GenericFile) => {
        console.log(data);
        if (typeof data.pk !== "undefined") {
            console.log("setting data in create update file");
            Vue.set(state.files.data, data.pk, data);
            console.log(state.files.data);
        }
    },

    /**
     * delete_file deletes a file from the state, if it  exists.
     * It accepts either the full GenericFile or just the string
     * identifier.
     */
    delete_file: (state, data: GenericFile | string) => {
        if (typeof data === "string") {
            Vue.delete(state.files.data, data);
        } else  {
            Vue.delete(state.files.data, data.pk);
        }
    },

    /**
     * change_limit changes the limit of files you can upload.
     */
    change_limit: (state, limit: number) => {
        state.limit = limit;
    },

    /**
     * clear_files clears out all files
     */
    clear_files: (state) => {
        state.files = new ModelMap<GenericFile>();
    }
}

/**
 * Getters - 
 */
export const getters = {
    files: state => state.files,
    filesUploadStatus: state => state.files.data,
    allFilesUploadComplete: (state: FileState) => {
        console.log(state.files);
        console.log(state.files!.length);
        if (state.files!.length > 0) {
            let oneHundredPercent = every(state.files!.data, {"percent": 100});
            console.log("one hundred: "  + oneHundredPercent);
            //This currently doesn't compile - says val is a number or string.
            /*
            let hasURL = reduce(state.files, (res, val, key) => {
                if (val.url !== undefined) {
                    return true;
                }
                return false;
            }, false);*/
            let hasURL = true;
            return oneHundredPercent === true && hasURL === true;
        }
        return false;
    },
    hasFiles: state => {
        return state.files.length > 0;
    },
    pastLimit: state => {
        return state.files.length >= state.limit;
    }
}

// FileService definition
const FileService = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};

export default FileService;
