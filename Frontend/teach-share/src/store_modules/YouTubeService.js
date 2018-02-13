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
        newVideo: null,
        videoDetails: null
    },
    mutations: {
        LOAD_YOUTUBE_VIDEO_DATA: (state, data) => {
            console.log(state, data);
            state.videoDetails = Object.assign({}, data);
        },
        LOAD_VIDEO_INSTANCE: (state, data) => {
            state.newVideo = Object.assign({}, data);
        }

    },
    actions: {
        getYoutubeVideoInfo: (state, data) => {
            console.log(data);
            var videoURL = new URL(data);
            var videoID = videoURL.searchParams.get('v');
            let videoSection = 'snippet,statistics';
            var ApiURL = new URL(`https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=${videoSection}`);
            axios.get(ApiURL.toString())
                .then(resp => state.commit('LOAD_YOUTUBE_VIDEO_DATA', resp.data))
                .catch(err => console.log(err));
        },
        submitVideoEmbed: (state, data) => {
            state.commit('LOAD_VIDEO_INSTANCE', data);
        }
    },
    getters: {
        videoDescription: state => {
            var ending = '';
            if (state.videoDetails && state.videoDetails.items.length > 0) {
                if (state.videoDetails.items[0].snippet.description.length > 300) {
                    ending = '...';
                }
                return state.videoDetails.items[0].snippet.description.slice(0, 300) + ending;
            }
            return null;
        },
        videoThumbnail: state => {
            if (state.videoDetails && state.videoDetails.items.length > 0) {
                return state.videoDetails.items[0].snippet.thumbnails.default;
            }
            return '';
        },
        videoTitle: state => {
            if (state.videoDetails && state.videoDetails.items.length > 0) {
                return state.videoDetails.items[0].snippet.title;
            }
            return '';
        }
    }
};

export default YouTubeService;