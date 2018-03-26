import api from "../../api";
import Vue from "vue";
import axios from "axios";
import map from "lodash/map";
import forEach from "lodash/forEach";
import every from "lodash/every";
import reduce from "lodash/reduce";

import { RootState, GenericFile } from "../../models";
import { FileState } from "./state";
import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import actions from "./actions";

type FileContext = ActionContext<FileState, RootState>;

/**
 * The state for file uploads, other file operations.
 */
const state: FileState = {
    files: {},
    limit: 0
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
        if (typeof data.id !== "undefined") {
            if (!state.files.hasOwnProperty(data.id)) {
                Vue.set(state.files, data.id, data);
            }
        }
    },

    /**
     * create_update_file will primarily update a file.
     * but will also create files that don't already exist.
     */
    create_update_file: (state, data: GenericFile) => {
        if (typeof data.id !== "undefined") {
            Vue.set(state.files, data.id, data);
        }
    },

    /**
     * delete_file deletes a file from the state, if it  exists.
     * It accepts either the full GenericFile or just the string
     * identifier.
     */
    delete_file: (state, data: GenericFile | string) => {
        if (typeof data === "string") {
            Vue.delete(state.files, data);
        } else  {
            Vue.delete(state.files, data.id);
        }
    },

    /**
     * change_limit changes the limit of files you can upload.
     */
    change_limit: (state, data: number) => {
        state.limit = data;
    },

    /**
     * clear_files clears out all files
     */
    clear_files: (state) => {
        state.files = {};
    }
}

/**
 * Getters - 
 */
export const getters = {
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

// FileService definition
const FileService = {
    state,
    mutations,
    actions,
    getters
};

export default FileService;
