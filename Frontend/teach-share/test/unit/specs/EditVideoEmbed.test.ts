import Vue, {VueConstructor} from "vue";
import EditVideoEmbed from "../../../src/components/video/EditVideoEmbed.vue";
import router from "../../../src/router";
import store from "../../../src/store";
import { getVideoInfo } from "../../../src/store_modules/YouTubeService";
// import store from "../../../src/store";
import { expect } from "chai";

import { CONSTRUCT } from "../utils";


describe("[EDIT_VIDEO_EMBED.VUE] Embed video (youtube) view component", () => {
    it("should render correct contents", () => {
        const vm = CONSTRUCT(EditVideoEmbed);
        console.log(vm);
        console.log(vm.$el);
        // getVideoInfo()
        let input = "https://www.youtube.com/watch?v=KMX1mFEmM3E"
        let resp = vm.getYoutubeData(input);
        // console.log(vm.$store.state.yt.videoDetails);
        console.log(resp);
    });
   
});
