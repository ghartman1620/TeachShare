<template>
<div>

    <!-- <div class="col-xl-8 col-sm-10 col-xs-12"> -->
        <div class="card col-12">
            <nav>
                <div class="nav nav-tabs" id="nav-tab" role="tablist">
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
                </div>
            </nav>
            <div class="card-body">
                <div class="tab-content" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                    <!-- video embed -->
                        <edit-video-embed></edit-video-embed>
                    </div>
                    <div class="tab-pane fade"
                        id="nav-profile"
                        role="tabpanel"
                        aria-labelledby="nav-profile-tab">
                            <!-- video file -->
                            <edit-video-file></edit-video-file>
                    </div>
                </div>
            </div>
        </div>
    <!-- </div> -->
    <div class="col-xl-2 col-sm-1"></div>

</div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import EditVideoEmbed from "./EditVideoEmbed.vue";
import EditVideoFile from "./EditVideoFile.vue";
import { mapGetters } from "vuex";


import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

@Component({
    name: "edit-video",
    components: { EditVideoFile, EditVideoEmbed },
    props: []
})
export default class EditVideo extends Vue {
    styleObject: any = {"max-height": 100};

    get embedActiveStyle() {
        let t = this.$route.query.videotype;
        if (t === "embed") {
            return "nav-item nav-link active";
        }
        return "nav-item nav-link";
    }
    get uploadActiveStyle() {
        let t = this.$route.query.videotype;
        if (t === "upload") {
            return "nav-item nav-link active";
        }
        return "nav-item nav-link";
    }
    mounted(){
        var vm: EditVideo = this;
        this.$on("submitElement", function(element, index){
            vm.$parent.$emit("submitElement", element, index);
        });
    }
}
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

