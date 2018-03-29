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
/****************************************************************************/
/**
 * file_upload - for handling file uploads.
 *
 * @TODO: Simplify/break up
 *
 * @param  {Store} ctx
 * @param  {File[]} files
 */
export const upload_file =  async (ctx, files: File[]) => {
    console.log(ctx, files);
    try {
        // @TODO: get type safe definition for this.
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
                    mutUpdate(ctx, {
                        percent,
                        file,
                        pk: id,
                        cancel
                    });
                    // ctx.commit("UPDATE", {
                    //     percent,
                    //     file,
                    //     pk: id,
                    //     cancel
                    // });
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
                console.log(response.data);
                mutUpdate(ctx, response.data);
                // ctx.commit("UPDATE", response);

            } catch ( error ) {
                /**
                 * Uh-oh! there was an error in the axios request, while
                 * attempting to upload the file.
                 */
                console.log(error);
                if (axios.isCancel(error)) {
                    // let genFile = new GenericFile(id);
                    mutDelete(ctx, id);
                    // ctx.commit("DELETE", file);
                } else {
                    // @TODO: get type-checked send-notifications
                    ctx.dispatch("sendNotification",
                        {"type": "danger", "content": "Error uploading file!"}, {root: true},
                        null, {root: true});
                    console.error(error);
                }
            }
        }
        i++; // increment file count
    });
    return { status: "complete", error: null, finished: true };
}

/**
 * create_file - creates a file. Doesn't handle uploading, just
 * creating a file itself.
 *
 * @param  {Store} ctx
 * @param  {File} file
 */
export const create_file = (ctx, file: GenericFile) => {
    mutCreate(ctx, file);
}

export const actions = {
    create_file,
    upload_file,

    /**
     * remove_file - removes a file, looking it up using it's primary key,
     * id, uuid, etc.. This could be refactored to also take the actual
     * file instance. Changed.
     *
     * @param  {Store} ctx
     * @param  {string} file_id
     */
    remove_file: (ctx, file_id: string) => {
        mutDelete(ctx, file_id);
        // ctx.commit("DELETE", file_id);
    },

    /**
     * change_limit - used to change the file upload limit. This is traditionally
     * only enforced in the vue code, not this store.
     *
     * @param  {Store} ctx
     * @param  {string} limit
     */
    change_limit: (ctx, limit: number) => {
        mutChangeLimit(ctx, limit);
        // ctx.commit("CHANGE_LIMIT", limit);
    },

    /**
     * clear_files - used for resetting the files state item to a
     * brand new instance, thereby deleting previous items.
     *
     * @param  {Store} ctx
     */
    clear_files: (ctx) => {
        mutClear(ctx);
        // ctx.commit("CLEAR");
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
     *
     * @param  {} state
     * @param  {GenericFile} data
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
     *
     * @param  {} state
     * @param  {GenericFile} data
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
     *
     * @param  {} state
     * @param  {GenericFile|string} data
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
     *
     * @param  {} state
     * @param  {number} limit
     */
    CHANGE_LIMIT: (state, limit: number) => {
        state.limit = limit;
    },

    /**
     * clear_files clears out all files
     *
     * @param  {} state
     */
    CLEAR: (state) => {
        state.files = new ModelMap<GenericFile>();
    }
}

/**
 * Getters - used for calculating/'getting' values based on the state.
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
    strict: true,
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};

export default FileService;

/**
 * Type safe definitions for FileService
 */
const { commit, read, dispatch } =
     getStoreAccessors<FileState, RootState>("fs");

/**
 * Action Handlers
 */
export const uploadFiles = dispatch(FileService.actions.upload_file);
export const createFile = dispatch(FileService.actions.create_file);
export const removeFile = dispatch(FileService.actions.remove_file)
export const changeLimit = dispatch(FileService.actions.change_limit);
export const clearFiles = dispatch(FileService.actions.clear_files);

/**
 * Getter Handlers
 */
export const hasFiles = read(FileService.getters.has_files);
export const isPastLimit = read(FileService.getters.past_limit);
export const getFile = read(FileService.getters.get);

/**
 * Mutations Handlers
 */
export const mutCreate = commit(FileService.mutations.CREATE);
export const mutUpdate = commit(FileService.mutations.UPDATE);
export const mutDelete = commit(FileService.mutations.DELETE);
export const mutChangeLimit = commit(FileService.mutations.CHANGE_LIMIT);
export const mutClear = commit(FileService.mutations.CLEAR); 
