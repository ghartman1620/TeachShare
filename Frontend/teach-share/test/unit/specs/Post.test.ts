import Vue from "vue";
import Post from "../../../src/components/Post.vue";
import router from "../../../src/router";
import store from "../../../src/store";
import _ from "lodash";

// font-awesome icons
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import fontawesome from "@fortawesome/fontawesome";

import faUserCircle from "@fortawesome/fontawesome-free-solid/faUserCircle";
import faEdit from "@fortawesome/fontawesome-free-solid/faEdit";

fontawesome.library.add(faUserCircle, faEdit);


describe("[POST.VUE] component responsible for encapsulating a 'Post'", () => {
    it("should render correct contents", () => {
        // const Constructor = Vue.extend(Post);
        // const vm = new Constructor({ router, store }).$mount();
    });
});