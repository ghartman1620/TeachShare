import axios, { AxiosResponse } from "axios";
import { getStoreAccessors } from "vuex-typescript";

import { IRootState, NotifyType } from "../models";

import { sendNotification } from "./NotificationService";

export interface IYTState {
    videoDetails: any[];
}

const API_KEY = "AIzaSyAOHmdMqDLrCvAxnbkdTabddnKRZkpqPJY";

function isString(str: string | null): str is string {
    return (str as string) !== null;
}

const state = {
    videoDetails: []
};

interface IVideoURLValue {
    apiRequest: string;
    videoID: string;

}

export const defaultVideoSections = "snippet,statistics";

export const generateURL =
    (url: string, section: string = defaultVideoSections): IVideoURLValue => {
        const videoURL = new URL(url);
        const videoID = videoURL.searchParams.get("v");
        const ApiURL = new URL(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoID}&key=${API_KEY}&part=${section}`
        );
        return { apiRequest: ApiURL.toString(), videoID: videoID as string };
}

export const actions = {
    getYoutubeVideoInfo: async (ctx, url: string) => {
        const { apiRequest, videoID } = generateURL(url);
        console.log(apiRequest, videoID);
        if (videoID.length > 10) {
            try {
                const resp: AxiosResponse = await axios.get(apiRequest);
                mutSet(ctx, resp.data);
                sendNotification(ctx, { 
                    content: "successfully fetched youTube video data!",
                    type: NotifyType.success
                });
                return resp;
            } catch (err) {
                console.error("ERR:", err);
                sendNotification(ctx, { content: "unable to retrieve youtube video data", type: NotifyType.danger });
                return err;
            }
        }
    },
    clearYoutubeData: (ctx) => {
        mutClear(ctx);
    }
}

export const mutations = {
    SET: (ctx, data: any) => {
        if (ctx.videoDetails.length === 0) {
            ctx.videoDetails.push(data);
        }
        const exists = ctx.videoDetails.find((val) => val === data);
        if (typeof exists === "undefined") {
            ctx.videoDetails.push(data);
        }
    },
    CLEAR: (ctx) => {
        state.videoDetails = [];
    }
}

export const getters = {
    videoDescriptionSm: state => {
        let ending = "";
        if (state.videoDetails.length > 0 && state.videoDetails[0].items.length > 0) {
            if (state.videoDetails[0].items[0].snippet.description.length > 300) {
                ending = "...";
            }
            return (
                state.videoDetails[0].items[0].snippet.description.slice(0, 300) +
                ending
            );
        }
        return null;
    },
    videoDescription: state => {
        console.log("[YT]", state.videoDetails);
        if (state.videoDetails.length > 0 && state.videoDetails[0] && state.videoDetails[0].items.length > 0) {
            return state.videoDetails[0].items[0].snippet.description;
        }
        return null;
    },
    videoThumbnail: state => {
        if (state.videoDetails[0] && state.videoDetails[0].items.length > 0) {
            return state.videoDetails[0].items[0].snippet.thumbnails.default;
        }
        return "";
    },
    videoTitle: state => {
        if (state.videoDetails[0] && state.videoDetails[0].items.length > 0) {
            return state.videoDetails[0].items[0].snippet.title;
        }
        return "";
    },
    videoID: state => {
        if (state.videoDetails[0] && state.videoDetails[0].items.length > 0) {
            return state.videoDetails[0].items[0].id;
        }
        return "";
    }
};

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
     getStoreAccessors<IYTState, IRootState>("yt");

/**
 * Actions Handlers
 */
export const getVideoInfo = dispatch(YouTubeService.actions.getYoutubeVideoInfo);
export const clearVideoInfo = dispatch(YouTubeService.actions.clearYoutubeData);

/**
 * Getters Handlers
 */
export const smVideoDetail = read(YouTubeService.getters.videoDescriptionSm);
export const videoDetail = read(YouTubeService.getters.videoDescription);
export const videoThumbnail = read(YouTubeService.getters.videoThumbnail);
export const videoTitle = read(YouTubeService.getters.videoTitle);
export const videoID = read(YouTubeService.getters.videoID);

/**
 * Mutations Handlers
 */
export const mutSet = commit(YouTubeService.mutations.SET);
export const mutClear = commit(YouTubeService.mutations.CLEAR);
