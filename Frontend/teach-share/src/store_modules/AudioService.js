import Vue from "vue";
import api from "../api";

// YouTubeService definition
const AudioService = {
    state: {
        audio: []
    },
    mutations: {
        LOAD_AUDIO_INSTANCE: (state, data) => {
            let current = _.findIndex(state.audio, (v) => v.id === data.id);
            if (current > -1) {
                Vue.set(state.audio, current, data);
                return;
            }
            state.audio.push(data);
        },
        REMOVE_AUDIO_INSTANCE: (state, data) => {
            Vue.delete(state.audio, data);
        },
        CLEAR_AUDIO_INSTANCES: (state, data) => {
            state.audio = Object.assign([], []);
        }
    },
    actions: {
        submitAudioFiles: (state, data) => {
            if (data.length) {
                _.forEach(data, function (val) {
                    state.commit("LOAD_AUDIO_INSTANCE", val);
                });
                return;
            }
            state.commit("LOAD_VIDEO_INSTANCE", data);
        },
        removeAllAudioInstances: (state, data) => {
            state.commit("CLEAR_AUDIO_INSTANCES");
        },
        removeAudioInstance: (state, data) => {
            state.commit("REMOVE_AUDIO_INSTANCE", data);
        }
    },
    getters: {}
};

export default AudioService;