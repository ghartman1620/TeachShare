import { expect } from "chai";
import sinon from "sinon";
import {
    defaultVideoSections,
    generateURL,
    getters,
    IYTState,
    mutations,
    videoDetail,
    videoID,
    videoThumbnail,
    videoTitle
} from "../../../src/store_modules/YouTubeService";

import Vue from "vue";
import Vuex from "vuex";
import store from "../../../src/store";

Vue.use(Vuex);

/* eslint-disable no-new */
const vueInstance = new Vue({
    el: "#app",
    // router,
    store,
    components: { },
    template: "<div/>"
});

const { SET, CLEAR } = mutations;

function setup_state(): IYTState {
    const state: IYTState = {
        videoDetails: []
    };
    return state;
}

describe("[YOUTUBE] SET should push a video entry", () => {
    let state;
    let mockData;

    beforeEach(() => {
        state = setup_state();
        mockData = { dummy: "dummy data." };
        SET(state, mockData);
    });

    it("should create one entry", () => {
        expect(state.videoDetails[0]).to.eql(mockData);
    });
    it("should create two duplicate entries, and return only the one unique entry", () => {
        SET(state, mockData);
        const comp = new Array<any>();
        comp.push(mockData);
        expect(state.videoDetails).to.eql(comp);
    });
    it("should create two entries, with same keys but different values.", () => {
        const mockData2 = { dummy: "different dummy with same keys" };
        SET(state, mockData2);
        const comp = new Array<any>();
        comp.push(mockData);
        comp.push(mockData2);
        expect(state.videoDetails).to.eql(comp);
    });
    it("should create two entries, with same values but different keys.", () => {
        const mockData2 = { different: "dummy data." };
        SET(state, mockData2);
        const comp = new Array<any>();
        comp.push(mockData);
        comp.push(mockData2);
        expect(state.videoDetails).to.eql(comp);
    });
});

describe("[YOUTUBE] generateURL", () => {
    it("should create a correct url and parsed video ID", () => {
        const video = "https://www.youtube.com/watch?v=MczSxA0RrVU";
        const url = new URL("", video);
        const result = generateURL(video);

        const expected = `https://www.googleapis.com/youtube/v3/videos?\
id=MczSxA0RrVU&key=AIzaSyAOHmdMqDLrCvAxnbkdTabddnKRZkpqPJY&\
part=snippet,statistics`;

        expect(result.apiRequest).to.equal(expected);
        expect(result.videoID).to.equal("MczSxA0RrVU");
    });
});

describe("[YOUTUBE] getters", () => {
    let state;
    let mockData;
    let sandbox;
    let server;

    beforeEach(() => {
        state = setup_state();
        mockData = { dummy: "dummy data." };
        SET(state, mockData);
        sandbox = sinon.sandbox.create();
        server = sandbox.useFakeServer();
    });

    afterEach(() => {
        server.restore();
        sandbox.restore();
    });

    it("videoDetail should return a video description", () => {
        const video = "https://www.youtube.com/watch?v=MczSxA0RrVU";
        const url = new URL("", video);
        const result = generateURL(video);

        const expected = `https://www.googleapis.com/youtube/v3/videos?\
id=MczSxA0RrVU&key=AIzaSyAOHmdMqDLrCvAxnbkdTabddnKRZkpqPJY&\
part=snippet,statistics`;

        const value = videoDetail(store);

    });
});
