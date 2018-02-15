import Vue from "vue";
import api from "../api";

// YouTubeService definition
const VideoService = {
    state: {
        newVideos: []
    },
    mutations: {
        LOAD_VIDEO_INSTANCE: (state, data) => {
            state.newVideos = Object.assign([], [data]);
        },
        LOAD_VIDEO_INSTANCES: (state, data) => {
            state.newVideos = Object.assign([], data);
        }
    },
    actions: {
        submitVideoEmbed: (state, data) => {
            console.log(data);
            state.commit("LOAD_VIDEO_INSTANCE", data);
        },
        submitVideoFiles: (state, data) => {
            console.log(data);
            state.commit("LOAD_VIDEO_INSTANCES", data);
        }
    },
    getters: {}
};

export default VideoService;