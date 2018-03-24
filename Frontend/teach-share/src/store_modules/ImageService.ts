import Vue from "vue";
import api from "../api";

// YouTubeService definition
const ImageService = {
    state: {
        images: []
    },
    mutations: {
        LOAD_IMAGE_INSTANCE: (state, data) => {
            let current = state.images.findIndex(v => v.id === data.id);
            if (current > -1) {
                Vue.set(state.images, current, data);
                return;
            }
            state.images.push(data);
        }
    },
    actions: {
        LoadImages: (state, data) => {
            if (data.length) {
                data.forEach( val => {
                    state.commit("LOAD_IMAGE_INSTANCE", val);
                });
                return;
            }
            state.commit("LOAD_IMAGE_INSTANCE", data);
        }
    },
    getters: {}
};

export default ImageService;