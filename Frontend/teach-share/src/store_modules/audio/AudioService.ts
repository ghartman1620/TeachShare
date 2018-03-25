import Vue from "vue";
import api from "../../api";

import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import { RootState } from "../../models";

import { AudioState } from "./state";
import { AudioElement } from "../../models";

type AudioContext = ActionContext<AudioState, RootState>;

const state: AudioState = {
    audio: {},
    error: false
}

/**
 * Mutations for audio elements
 */
const loadAudioInstance = "loadAudioInstance";
const removeAudioInstance = "removeAudioInstance";
const clearAudioInstance = "clearAudioInstance";
export const mutations = {
    loadAudioInstance: (state: AudioState, data: AudioElement) => {
        console.log(data);
        if (typeof state.audio !== "undefined") {
            state.audio[data.pk] = data;
        }
    },
    removeAudioInstance: (state: AudioState, data: AudioElement) => {
        if (typeof data !== "undefined" && typeof state.audio !== "undefined") {
            Object.assign(state.audio[data.pk], {});
        }
    },
    clearAudioInstance: (state, data) => {
        state.audio = undefined;
    }
}

/**
 * Actions for audio elements.
 */
export const actions = {
    submitAudioFiles: async (context, file) => {
        await context.commit(loadAudioInstance, file);
    },
    removeAllAudioInstances: async (context) => {
        context.commit(clearAudioInstance);
    },
    removeAudio: async (context, data) => {
        context.commit(removeAudioInstance, data);
    }
}

export const getters = {

}

const AudioService = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default AudioService;


/**
 * Type safe definitions for AudioService
 */
const { commit, read, dispatch } =
     getStoreAccessors<AudioState, RootState>("audio");

export const submitAudio = dispatch(AudioService.actions.submitAudioFiles);
export const clearAudio = commit(AudioService.actions.removeAllAudioInstances);
