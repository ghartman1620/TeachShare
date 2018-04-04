import { expect } from "chai";
import {
    mutations,
    getters,
    YTState,
    generateURL,
    defaultVideoSections
} from "../../../src/store_modules/YouTubeService";

import Vue from "vue";
import Vuex from "vuex";
import store from "../../../src/store";

Vue.use(Vuex);

/* eslint-disable no-new */
let vueInstance = new Vue({
    el: "#app",
    // router,
    store,
    components: { },
    template: "<div/>"
});


// console.log("MUTATIONS: ", Object.keys(mutations));
const { SET, CLEAR } = mutations;


function setup_state(): YTState {
    const state: YTState = {
        videoDetails: []
    }
    return state;
}

describe("[YOUTUBE] SET should push a video entry", () => {
    it("should create one entry", () => {
        const state = setup_state();
        let mockData = { dummy: "dummy data." };
        SET(state, mockData);
        expect(state.videoDetails[0]).to.eql(mockData);
    });
    it("should create two duplicate entries, and return only the one unique entry", () => {
        const state = setup_state();
        let mockData = { dummy: "dummy data." };
        SET(state, mockData);
        SET(state, mockData);
        let comp = new Array<any>();
        comp.push(mockData);
        expect(state.videoDetails).to.eql(comp);
    });
    it("should create two entries, with same keys but different values.", () => {
        const state = setup_state();
        let mockData = { dummy: "dummy data." };
        let mockData2 = { dummy: "different dummy with same keys" };
        SET(state, mockData);
        SET(state, mockData2);
        let comp = new Array<any>();
        comp.push(mockData);
        comp.push(mockData2);
        expect(state.videoDetails).to.eql(comp);
    });
    it("should create two entries, with same values but different keys.", () => {
        const state = setup_state();
        let mockData = { dummy: "dummy data." };
        let mockData2 = { different: "dummy data." };
        SET(state, mockData);
        SET(state, mockData2);
        let comp = new Array<any>();
        comp.push(mockData);
        comp.push(mockData2);
        expect(state.videoDetails).to.eql(comp);
    });
});

describe("[YOUTUBE] generateURL", () => {
    it("should create a correct url and parsed video ID", () => {
        let video = "https://www.youtube.com/watch?v=MczSxA0RrVU";
        let url = new URL('', video);
        let result = generateURL(video);
        let expected = `https://www.googleapis.com/youtube/v3/videos?id=MczSxA0RrVU&key=AIzaSyAOHmdMqDLrCvAxnbkdTabddnKRZkpqPJY&part=snippet,statistics`
        expect(result.apiRequest).to.equal(expected);
        expect(result.videoID).to.equal("MczSxA0RrVU")
    });
});

