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
    limit: 1
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
export const upload_file =  async (ctx, files: any[]) => {
    console.log(ctx, files);
    try {
        let postid = await ctx.dispatch("saveDraft", null, {root: true});
        console.log(postid);
    } catch (err) {
        console.log(err);
    }

    let i: number = 0;
    files.forEach( async (file: File) => {
        let fileAlreadyUploaded = false;

        ctx.state.files.keys.forEach( element => {
            /**
             * @changed: ==, ===
             * Test whether or not a file is already uploaded.
             */
            debugger;
            console.log("element", element);
            console.log("file", file);
            if (ctx.state.files.get(element).file.name === file.name) {
                fileAlreadyUploaded = true;
            }
        });
        if (!fileAlreadyUploaded && i + ctx.state.files.length < ctx.state.limit) {
            console.log(ctx.state.files)
            let id = uuidv4();
            let cancelToken = axios.CancelToken;
            let cancel = cancelToken.source();
            let config = {
                onUploadProgress: progressEvent => {
                    let percent = Math.floor(
                        progressEvent.loaded * 100 / progressEvent.total
                    );
                    ctx.commit("UPDATE", {
                        percent,
                        file,
                        pk: id,
                        cancel
                    });
                },
                cancelToken: cancel.token
            };
            try {
                /**
                 * make request
                 */
                let response = await api
                    .put(`upload/${file.name}?id=${id}&post=${ctx.rootGetters.getCurrentPostId}`,
                        file, config);

                // update the current uploaded file object
                ctx.commit("UPDATE", response);

            } catch ( error ) {
                /**
                 * Uh-oh! there was an error in the axios request, while
                 * attempting to upload the file.
                 */
                console.log(error);
                if (axios.isCancel(error)) {
                    ctx.commit("DELETE", file);
                } else {
                    ctx.dispatch("sendNotification",
                        {"type": "danger", "content": "Error uploading file!"}, {root: true},
                        null, {root: true});
                    console.error(error);
                }
            }
        }
        i++; // increment file count
    });
}

export const create_file = async (ctx, file) => {

}

export const actions = {
    create_file,
    upload_file,
    remove_file: (ctx, file) => {
        ctx.commit("DELETE", file);
    },
    change_limit: (ctx, limit) => {
        ctx.commit("CHANGE_LIMIT", limit);
    },
    clear_files: (ctx) => {
        ctx.commit("CLEAR");
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
    CREATE: (state, data: GenericFile) => {
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
    UPDATE: (state, data: GenericFile) => {
        if (typeof data.pk !== "undefined") {
            Vue.set(state.files.data, data.pk, data);
        }
    },

    /**
     * delete_file deletes a file from the state, if it  exists.
     * It accepts either the full GenericFile or just the string
     * identifier.
     */
    DELETE: (state, data: GenericFile | string) => {
        if (typeof data === "string") {
            Vue.delete(state.files.data, data);
        } else  {
            Vue.delete(state.files.data, data.pk);
        }
    },

    /**
     * change_limit changes the limit of files you can upload.
     */
    CHANGE_LIMIT: (state, limit: number) => {
        state.limit = limit;
    },

    /**
     * clear_files clears out all files
     */
    CLEAR: (state) => {
        state.files = new ModelMap<GenericFile>();
    }
}

/**
 * Getters - 
 */
export const getters = {
    filesUploadStatus: (state) => state.files.data,
    allFilesUploadComplete: (state) => {
        if (state.files.length > 0) {
            let oneHundredPercent = state.files.keys.every(val => state.files.get(val).percent === 100);
            let hasURL = reduce(state.files.keys, (res, val, key) => {
                console.log(res, key, val)
                if (state.files.get(val).url !== undefined) {
                    return true;
                }
                return false;
            }, false);
            return oneHundredPercent === true && hasURL === true;
        }
        return false;
    },
    has_files: state => {
        return state.files.length > 0;
    },
    past_limit: state => {
        return state.files.length >= state.limit;
    },
    get: state => (id: string): GenericFile => {
        console.log("getting id: ", id);
        return state.files.get(id);
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

/**
 * Type safe definitions for AudioService
 */
const { commit, read, dispatch } =
     getStoreAccessors<FileState, RootState>("fs");

/**
 * Action Handlers
 */
export const upload = dispatch(FileService.actions.upload_file);
export const create = dispatch(FileService.actions.create_file);
export const remove = dispatch(FileService.actions.remove_file)
export const changeLimit = dispatch(FileService.actions.change_limit);
export const clear = dispatch(FileService.actions.clear_files);

/**
 * Getter Handlers
 */
export const hasFiles = read(FileService.getters.has_files);
export const isPastLimit = read(FileService.getters.past_limit);
export const test_lookup = read(FileService.getters.get);

/**
 * Mutations Handlers
 */
export const mutCreate = commit(FileService.mutations.CREATE);
export const mutUpdate = commit(FileService.mutations.UPDATE);
export const mutDelete = commit(FileService.mutations.DELETE);
export const mutChangeLimit = commit(FileService.mutations.CHANGE_LIMIT);
export const mutClear = commit(FileService.mutations.CLEAR);
