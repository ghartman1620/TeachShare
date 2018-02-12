import Vue from 'vue';
import axios from 'axios';
// var { google } = require('googleapis')

// Load some necessary libraries
var _ = require('lodash');

var API_KEY = 'AIzaSyAOHmdMqDLrCvAxnbkdTabddnKRZkpqPJY';
var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];
var SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

function handleClientLoad() {
    gapi.load('client:auth2', init);
}

function init() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        apiKey: API_KEY,
        scope: SCOPES
    }).then((state) => {
        google = gapi;
        console.log('INIT!')
    });
}


var google;

// YouTubeService definition
const YouTubeService = {
    state: {
        ytInit: false,
        videos: [],
        videoDetails: null
    },
    mutations: {
        INIT: (state, data) => {
            console.log(state, data)
            state.ytInit = true;
        },
        LOAD_VIDEO_DATA: (state, data) => {
            console.log(state, data);
            state.videoDetails = Object.assign({}, data);
        }

    },
    actions: {
        initialize: (state) => {
            console.log('STATE: ', state);
            gapi.client.init({
                discoveryDocs: DISCOVERY_DOCS,
                apiKey: API_KEY,
                // clientId: 'bryan.mccoid',
                scope: SCOPES
            }).then((state) => {
                // console.log(resp)
                google = gapi;
                console.log('INIT!')

                state.commit('INIT', true);
            });
        },
        getYoutubeVideoInfo: (state, data) => {
            console.log(data);
            var videoURL = new URL(data);
            var videoID = videoURL.searchParams.get('v');
            let videoSection = 'snippet,statistics';
            var ApiURL = new URL(`https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=${videoSection}`);
            axios.get(ApiURL.toString())
                .then(resp => state.commit('LOAD_VIDEO_DATA', resp.data))
                .catch(err => console.log(err));
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
        }
    }
};

export default YouTubeService;