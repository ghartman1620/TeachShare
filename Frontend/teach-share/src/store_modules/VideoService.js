import Vue from 'vue';
import api from '../api';
import axios from 'axios';

// Load some necessary libraries
var _ = require('lodash');
const uuidv4 = require('uuid/v4');

var API_KEY = 'AIzaSyAOHmdMqDLrCvAxnbkdTabddnKRZkpqPJY';

// YouTubeService definition
const YouTubeService = {
    state: {
        newVideo: null
    },
    mutations: {
        LOAD_VIDEO_INSTANCE: (state, data) => {
            state.newVideo = Object.assign({}, data);
        }

    },
    actions: {
        submitVideoEmbed: (state, data) => {
            console.log(data)
            state.commit('LOAD_VIDEO_INSTANCE', data);
        }
    },
    getters: {

    }
};

export default YouTubeService;