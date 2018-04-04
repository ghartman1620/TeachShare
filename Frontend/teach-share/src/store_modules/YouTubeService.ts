import Vue from "vue";
import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import { RootState } from "../models";

import axios, { AxiosRequestConfig, AxiosPromise, AxiosResponse } from "axios";
import api from "../api";

export interface YTState {
    videoDetails: any[];
}

var API_KEY = "AIzaSyAOHmdMqDLrCvAxnbkdTabddnKRZkpqPJY";

function isString(str: String | null): str is String {
    return (<String>str) !== null;
}

const state = {
    videoDetails: []
}

interface YtURLValue {
    apiRequest: string;
    videoID: string;

}

export const defaultVideoSections = "snippet,statistics";

export const generateURL =
    function (url: string, section: string = defaultVideoSections): YtURLValue {
        let videoURL = new URL(url);
        let videoID = videoURL.searchParams.get("v");
        let ApiURL = new URL(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=${section}`
        );
        return { apiRequest: ApiURL.toString(), videoID: videoID as string };
}

export const actions = {
    getYoutubeVideoInfo: async (ctx, url: string) => {
        console.log("url: ", url);
        let { apiRequest, videoID } = generateURL(url);
        console.log(apiRequest, videoID);
        if (videoID.length > 10) {
            try {
                let resp: AxiosResponse = await axios.get(apiRequest);
                console.log("ACTION:", resp);
                mutSet(ctx, resp.data);
                return resp;
            } catch (err) {
                console.error("ERR:", err);
                return err;
            }
        }
    },
    clearYoutubeData: ctx => {
        mutClear(ctx);
    }
}

export const mutations = {
    SET: (ctx, data: any) => {
        if (ctx.videoDetails.length === 0) {
            ctx.videoDetails.push(data);
        }
        let exists = ctx.videoDetails.find((val) => val === data);
        if (typeof exists === "undefined") {
            ctx.videoDetails.push(data);
        }
    },
    CLEAR: (ctx) => {
        state.videoDetails = [];
    }
}

export const getters = {
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

// YouTubeService definition
const YouTubeService = {
    strict: true,
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};

export default YouTubeService;

/**
 * Type safe definitions for CommentService
 */
const { commit, read, dispatch } =
     getStoreAccessors<YTState, RootState>("yt");

/**
 * Actions Handlers
 */
export const getVideoInfo = dispatch(YouTubeService.actions.getYoutubeVideoInfo);
export const clearVideoInfo = dispatch(YouTubeService.actions.clearYoutubeData);

/**
 * Getters Handlers
 */
export const smVideoDetail = read(YouTubeService.getters.ytVideoDescriptionShort);
export const videoDetail = read(YouTubeService.getters.ytVideoDescription);
export const videoThumbnail = read(YouTubeService.getters.ytVideoThumbnail);
export const videoTitle = read(YouTubeService.getters.ytVideoTitle);
export const videoID = read(YouTubeService.getters.ytVideoID);

/**
 * Mutations Handlers
 */
export const mutSet = commit(YouTubeService.mutations.SET);
export const mutClear = commit(YouTubeService.mutations.CLEAR);
