import Vue from "vue";
import api from "../api";
import axios from "axios";

// typescript 'require' workaround hack
declare function require(name:string): any;

// Load some necessary libraries
var _ = require("lodash");
const uuidv4 = require("uuid/v4");

var API_KEY = "AIzaSyAOHmdMqDLrCvAxnbkdTabddnKRZkpqPJY";

function isString(str: String | null): str is String {
    return (<String>str) !== null;
}

// YouTubeService definition
const YouTubeService = {
    state: {
        ytVideoDetails: null
    },
    mutations: {
        LOAD_YOUTUBE_VIDEO_DATA: (state, data) => {
            state.ytVideoDetails = Object.assign({}, data);
        },
        CLEAR_YT_DATA: (state, data) => {
            state.ytVideoDetails = null;
        }
    },
    actions: {
        getYoutubeVideoInfo: (state, data) => {
            var videoURL = new URL(data);
            var videoID = videoURL.searchParams.get("v");
            let videoSection = "snippet,statistics";
            var ApiURL = new URL(
                `https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=${videoSection}`
            );
            if ( isString(videoID) && videoID.length > 10) {
                axios
                    .get(ApiURL.toString())
                    .then(resp => state.commit("LOAD_YOUTUBE_VIDEO_DATA", resp.data))
                    .catch(err => console.error(err));
            }
        },
        clearYoutubeData: state => {
            state.commit("CLEAR_YT_DATA");
        }
    },
    getters: {
        ytVideoDescriptionShort: state => {
            var ending = "";
            if (state.ytVideoDetails && state.ytVideoDetails.items.length > 0) {
                if (state.ytVideoDetails.items[0].snippet.description.length > 300) {
                    ending = "...";
                }
                return (
                    state.ytVideoDetails.items[0].snippet.description.slice(0, 300) +
                    ending
                );
            }
            return null;
        },
        ytVideoDescription: state => {
            if (state.ytVideoDetails && state.ytVideoDetails.items.length > 0) {
                return state.ytVideoDetails.items[0].snippet.description;
            }
            return null;
        },
        ytVideoThumbnail: state => {
            if (state.ytVideoDetails && state.ytVideoDetails.items.length > 0) {
                return state.ytVideoDetails.items[0].snippet.thumbnails.default;
            }
            return "";
        },
        ytVideoTitle: state => {
            if (state.ytVideoDetails && state.ytVideoDetails.items.length > 0) {
                return state.ytVideoDetails.items[0].snippet.title;
            }
            return "";
        },
        ytVideoID: state => {
            if (state.ytVideoDetails && state.ytVideoDetails.items.length > 0) {
                return state.ytVideoDetails.items[0].id;
            }
            return "";
        }
    }
};

export default YouTubeService;