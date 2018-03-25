import Vue from "vue";
import api from "../../api";

import { getStoreBuilder } from "vuex-typex"
import Vuex, { Store, ActionContext } from "vuex"

import { RootState } from "../../models";
import { AudioState } from "./state";
import { AudioElement } from "../../models";

import { storeBuilder } from "../../store";

type AudioContext = ActionContext<AudioState, RootState>;

const state: AudioState = {
    audio: new Array<AudioElement>(),
    error: false
}

export const mutations = {
    loadAudioInstance: (state: AudioState, data: AudioElement) => {
        if (typeof state.audio !== "undefined") {
            let current = state.audio.findIndex((v: AudioElement) => v.pk === data.pk);
            if (current > -1) {
                Vue.set(state.audio, current, data);
                return;
            }
            state.audio.push(data);
        }
    },
    removeAudioInstance: (state: AudioState, data: AudioElement) => {
        if (typeof data !== "undefined" && typeof state.audio !== "undefined") {
            Vue.delete(state.audio, data.pk);
        }
    },
    clearAudioInstance: (state, data) => {
        state.audio = undefined;
    }
}

const clearAudioInstance = "clearAudioInstance";
const removeAudioInstance = "removeAudioInstance";
const removeAudio = "removeAudio";

export const actions = {
    submitAudioFiles: (context: AudioContext, file: AudioElement) => {
        context.commit("loadAudioInstance", file);
    },
    removeAllAudioInstances: async (context: AudioContext) => {
        context.commit(clearAudioInstance);
    },
    removeAudio: async (context: AudioContext, data: AudioElement) => {
        context.commit(removeAudio, data);
    }
}

export const getters = {

}

// Module
const AudioService = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}

export default AudioService;
