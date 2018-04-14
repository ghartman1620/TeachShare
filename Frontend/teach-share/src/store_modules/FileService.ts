import axios from "axios"
import v4 from "uuid/v4";
import reduce from "lodash/reduce";
import store from "../store";
import Vue from "vue";

import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import { getCurrentPostId} from "./PostCreateService";


import api from "../api";
import { GenericFile, IRootState, ModelMap, NotifyType } from "../models";

import { sendNotification } from "../store_modules/NotificationService";

export interface FileState {
    files?: ModelMap<GenericFile>;
    limit: number;
}

type FileContext = ActionContext<FileState, IRootState>;
import {PostContext} from "./PostCreateService";

/**
 * The state for file uploads, other file operations.
 */
const state: FileState = {
    files: new ModelMap<GenericFile>(),
    limit: 1
};

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
export const upload_file = async (context: FileContext | PostContext, files: File[]) => {
    let postid = getCurrentPostId(<PostContext>context);
    console.log(postid);
    let ctx: FileContext = <FileContext>context;
    let i: number = 0;
    files.forEach(async (file: File) => {
        let fileAlreadyUploaded = false;

        ctx.state!.files!.keys.forEach(element => {
            /**
             * @changed: ==, ===
             * Test whether or not a file is already uploaded.
             */
            console.log("element", element);
            console.log("file", file);
            if (ctx.state!.files!.get(element)!.file!.name === file.name) {
                fileAlreadyUploaded = true;
            }
        });
        if (
            !fileAlreadyUploaded &&
            i + ctx.state!.files!.length < ctx.state.limit
        ) {
            console.log(ctx.state.files);
            let id = v4();
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
                        cancel,
                        url: undefined,
                        name: file.name
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
                const response = await api.put(
                    `upload/${file.name}?id=${id}&post=${
                        postid
                    }`,
                    file,
                    config
                );
                console.log(response);
                const fileResponse: GenericFile = new GenericFile(
                    response.data.request_id,
                    100,
                    file,
                    undefined,
                    response.data.url,
                )
                // update the current uploaded file object
                console.log(fileResponse);
                mutUpdate(ctx, fileResponse);
                // ctx.commit("UPDATE", response);
            } catch (error) {
                /**
                 * Uh-oh! there was an error in the axios request, while
                 * attempting to upload the file.
                 */
                console.log(error);
                if (axios.isCancel(error)) {
                    sendNotification(store, { type: NotifyType.warning, content: `Upload canceled! ${error}.` });
                } else {
                    // @TODO: get type-checked send-notifications
                    sendNotification( store, 
                        { type: NotifyType["danger"], content: "Error uploading file!" },
                    
                    );
                    console.error(error);
                }
                mutDelete(ctx, id);
            }
        }
        i++; // increment file count
    });
    return { status: "complete", error: null, finished: true };
};

export const actions = {
    upload_file,

    /**
     * create_file - creates a file. Doesn't handle uploading, just
     * creating a file itself.
     *
     * @param  {Store} ctx
     * @param  {File} file
     */
    create_file: (ctx, file: GenericFile) => {
        mutCreate(ctx, file);
    },

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
    clear_files: ctx => {
        mutClear(ctx);
        // ctx.commit("CLEAR");
    }
};

/**
 * Mutations - Handles CRUD operations, as well as file upload
 * limits and completely clearing files.
 */
export const mutations = {
    /**
     * create_file will create a file. It will NOT replace
     * a file with the same key. Use update for that.
     *
     * @param  {} ctx
     * @param  {GenericFile} data
     */
    CREATE: (ctx, data: GenericFile) => {
        console.log(ctx, typeof ctx);
        if (typeof data.pk !== "undefined") {
            if (!ctx.files.data.hasOwnProperty(data.pk)) {
                Vue.set(ctx.files.data, data.pk, data);
            }
        }
    },

    /**
     * create_update_file will primarily update a file.
     * but will also create files that don't already exist.
     *
     * @param  {FileState} state
     * @param  {GenericFile} data
     */
    UPDATE: (state: FileState, data: GenericFile) => {
        if (typeof data.pk !== "undefined") {
            Vue.set(state.files!.data, data.pk, data);
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
        } else {
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
    CLEAR: state => {
        state.files = new ModelMap<GenericFile>();
    }
};

/**
 * Getters - used for calculating/'getting' values based on the state.
 */
export const getters = {
    files: (ctx) => ctx.files,
    filesUploadStatus: (ctx) => ctx.files.data,
    allFilesUploadComplete: (ctx) => {
        if (ctx.files.length > 0) {
            const oneHundredPercent = ctx.files.keys.every(
                (val) => ctx.files.get(val).percent === 100
            );
            const hasURL = reduce(
                ctx.files.keys,
                (res, val, key) => {
                    if (ctx.files.get(val).url !== undefined) {
                        return true;
                    }
                    return false;
                },
                false
            );
            return oneHundredPercent === true && hasURL === true;
        }
        return false;
    },
    has_files: (ctx) => {
        return ctx.files.length > 0;
    },
    past_limit: (ctx) => {
        return ctx.files.length >= ctx.limit;
    },
    get: (ctx) => (id: string): GenericFile => {
        return ctx.files.get(id);
    }
};

// FileService definition
const FileService = {
    namespaced: true,
    strict: process.env.NODE_ENV !== "production",
    state,
    mutations,
    actions,
    getters
};

export default FileService;

/**
 * Type safe definitions for FileService
 */
const { commit, read, dispatch } = getStoreAccessors<FileState, IRootState>(
    "fs"
);

/**
 * Action Handlers
 */
export const uploadFiles = dispatch(FileService.actions.upload_file);
export const createFile = dispatch(FileService.actions.create_file);
export const removeFile = dispatch(FileService.actions.remove_file);
export const changeLimit = dispatch(FileService.actions.change_limit);
export const clearFiles = dispatch(FileService.actions.clear_files);

/**
 * Getter Handlers
 */
export const filesUploadStatus = read(FileService.getters.filesUploadStatus);
export const hasFiles = read(FileService.getters.has_files);
export const isPastLimit = read(FileService.getters.past_limit);
export const getFile = read(FileService.getters.get);
export const allFilesUploadComplete = read(FileService.getters.allFilesUploadComplete);
export const files = read(FileService.getters.files);

/**
 * Mutations Handlers
 */
export const mutCreate = commit(FileService.mutations.CREATE);
export const mutUpdate = commit(FileService.mutations.UPDATE);
export const mutDelete = commit(FileService.mutations.DELETE);
export const mutChangeLimit = commit(FileService.mutations.CHANGE_LIMIT);
export const mutClear = commit(FileService.mutations.CLEAR);
