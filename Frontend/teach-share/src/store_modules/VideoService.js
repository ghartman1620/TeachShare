import Vue from "vue";
import api from "../api";

// YouTubeService definition
const VideoService = {
    state: {
        videos: []
    },
    mutations: {
        LOAD_VIDEO_INSTANCE: (state, data) => {
            let current = _.findIndex(state.videos, v => v.id === data.id);
            if (current > -1) {
                Vue.set(state.videos, current, data);
                return;
            }
            state.videos.push(data);
        },
        LOAD_VIDEO_INSTANCES: (state, data) => {
            state.videos = Object.assign([], data);
        },
        REMOVE_VIDEO: (state, data) => {
            Vue.delete(state.videos, data);
        },
        CLEAR_VIDEOS: (state, data) => {
            state.videos = Object.assign([], []);
        }
    },
    actions: {
        submitVideoEmbed: (state, data) => {
            state.commit("LOAD_VIDEO_INSTANCE", data);
        },
        submitVideoFiles: (state, data) => {
            if (data.length) {
                _.forEach(data, function (val) {
                    state.commit("LOAD_VIDEO_INSTANCE", val);
                });
                return;
            }
            state.commit("LOAD_VIDEO_INSTANCE", data);
        },
        submitVideoFile: (state, data) => {
            state.commit("LOAD_VIDEO_INSTANCE", data);
        },
        removeAllVideos: (state, data) => {
            state.commit("CLEAR_VIDEOS");
        },
        removeVideo: (state, data) => {
            state.commit("REMOVE_VIDEO", data);
        }
    },
    getters: {}
};

export default VideoService;