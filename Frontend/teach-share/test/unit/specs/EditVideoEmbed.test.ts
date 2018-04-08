import sinon from "sinon";
import Vue, {VueConstructor} from "vue";
import EditVideoEmbed from "../../../src/components/video/EditVideoEmbed.vue";
import router from "../../../src/router";
import store from "../../../src/store";
import { getVideoInfo } from "../../../src/store_modules/YouTubeService";

// import store from "../../../src/store";
import { expect } from "chai";

import { CONSTRUCT } from "../utils";

describe("[EDIT_VIDEO_EMBED.VUE] Embed video (youtube) view component", () => {
    let vm;
    let sandbox;
    let server;

    beforeEach(() => {
        vm = CONSTRUCT(EditVideoEmbed);
        sandbox = sinon.sandbox.create();
        server = sandbox.useFakeServer();
    });

    afterEach(() => {
        server.restore();
        sandbox.restore();
    });

    it("should make youtube request", () => {
        console.log(vm);
        console.log(vm.$el);
        const input = "https://www.youtube.com/watch?v=KMX1mFEmM3E"

        vm.getYoutubeData(input).then((resp) => {
            expect(resp.status).to.equal(200);
            expect(resp.data).to.eql({etag: "", items: [{etag: "", snippet: "", statistics: ""}] });
        });

        setTimeout(() => server.respond([200,
            {
                "Content-Type": "application/json"
            },
            JSON.stringify({etag: "", items: [{ etag: "", snippet: { thumbnails: "test" }, statistics: "" }]})]), 0);
    });

});
