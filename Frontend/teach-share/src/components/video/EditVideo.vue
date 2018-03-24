<template>
    <div>
        <b-card>
            <!-- <nav>
                <b-nav tabs>
                    <b-nav-item>
                        <router-link :class="embedActiveStyle"
                            id="nav-home-tab"
                            data-toggle="tab"
                            href="#nav-home"
                            :to="{name: 'edit-video', query: {index: this.$route.query.index, videotype: 'embed' }}"
                            role="tab"
                            aria-controls="nav-home"
                            aria-selected="true">
                                Video Link (YouTube, Vimeo, etc...)
                        </router-link>
                    </b-nav-item>
                    <b-nav-item>
                        <router-link :class="uploadActiveStyle"
                            id="nav-profile-tab"
                            data-toggle="tab"
                            href="#nav-profile"
                            :to="{name: 'edit-video', query: {index: this.$route.query.index, videotype: 'upload' }}"
                            role="tab"
                            aria-controls="nav-profile"
                            aria-selected="false">
                                Video File
                        </router-link>
                    </b-nav-item>
                </b-nav>
            </nav>
            <div class="card-body">
                <div class="tab-content" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">

                        <edit-video-embed></edit-video-embed>
                    </div>
                    <div class="tab-pane fade"
                        id="nav-profile"
                        role="tabpanel"
                        aria-labelledby="nav-profile-tab">
                            <edit-video-file></edit-video-file>
                    </div>
                </div>
            </div> -->

            <!-- This b-tabs component is very cool! It does all that commented out stuff we have above -->
            <b-tabs>
                <b-tab title="Embed">
                    <br>
                    <edit-video-embed/>
                </b-tab>
                <b-tab title="Upload">
                    <br>
                    <edit-video-file/>
                </b-tab>
                
            </b-tabs>
        </b-card>
    </div>
</template>

<script>
import Vue from "vue";
import EditVideoEmbed from "./EditVideoEmbed";
import EditVideoFile from "./EditVideoFile";
import { mapGetters } from "vuex";

var _ = require("lodash");

export default Vue.component("edit-video", {
    components: { EditVideoFile, EditVideoEmbed },
    props: [],
    data() {
        return {
            styleObject: {
                "max-height": 100
            }
        };
    },
    computed: {
        embedActiveStyle() {
            let t = this.$route.query.videotype;
            if (t === "embed") {
                return "nav-item nav-link active";
            }
            return "nav-item nav-link";
        },
        uploadActiveStyle() {
            let t = this.$route.query.videotype;
            if (t === "upload") {
                return "nav-item nav-link active";
            }
            return "nav-item nav-link";
        },
        descriptionEmbed() {
            return this.$store.state.video.videos[0].description;
        },
        descriptionFile() {
            return this.$store.state.video.videos[0].description;
        },
        removedFile() {
            var vm = this;
            this.$on("RemoveItem", function(item) {
                vm.$dispatch("removeVideo", item);
            });
        }
    }
});
</script>



<style lang="scss" scoped>
.video-element {
    height: 100px;
}

.fade-transition {
    backface-visibility: hidden;
    transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave {
    backface-visibility: hidden;
    opacity: 0;
}
</style>

