import Vue from "vue";
import api from "../api";

// YouTubeService definition
const ImageService = {
    state: {
        images: []
    },
    mutations: {
        LOAD_IMAGE_INSTANCE: (state, data) => {
            let current = _.findIndex(state.images, (v) => v.id === data.id);
            if (current > -1) {
                console.log(data);
                Vue.set(state.images, current, data);
                return;
            }
            state.images.push(data);
        }
    },
    actions: {
        LoadImages: (state, data) => {
            console.log('SUBMIT images: ', data)
            if (data.length) {
                _.forEach(data, function(val) {
                    state.commit('LOAD_IMAGE_INSTANCE', val);
                });
                return;
            }
            state.commit('LOAD_IMAGE_INSTANCE', data);
        }
    },
    getters: {}
};

export default ImageService;