<template>
    <div>
        <h1>Video Links</h1>
        <p>
            Enter the embed url here
        </p>
        <form v-on:submit.prevent="submit">
            <b-input-group prepend="Embed URL">
                <b-input
                    v-on:input="DebounceSubmit"
                    v-validate="'required|url|YoutubeEmbedURL'"
                    :class="{'input': true, 'outline-danger': errors.has('embedurl') }"
                    v-model="EmbedURL"
                    type="text"
                    name="embedurl"
                    aria-describedby="basic-addon3"/>
            </b-input-group>
                <span v-show="errors.has('embedurl')" class="help text-danger">{{ errors.first('embedurl') }}</span>
            <br>
            <transition name="fade">
                <div v-if="ytVideoDescription || ytVideoThumbnail || ytVideoTitle">
                    <!-- <div class="col-1"></div> -->
                    <b-row>
                        <b-col>
                            <b-media>
                                <b-img :src="ytVideoThumbnail.url" alt="Generic placeholder image"/>
                                <div>
                                    <h5>{{ ytVideoTitle }}</h5>
                                        {{ytVideoDescriptionShort}}
                                </div>
                            </b-media>
                        </b-col>
                    </b-row>
                    <br>
                    <b-row>
                        <!-- dimension picker -->
                        <b-col cols="8">
                            <dimension-picker></dimension-picker>
                        </b-col>
                        <b-col cols="4">
                            <b-form-checkbox v-model="includeYtData" class="form-check-input" type="checkbox" value="" id="ytcheck">
                                Include YouTube Video Information
                            </b-form-checkbox>
                        </b-col>
                    </b-row>
                </div>
            </transition>
            <br> 
            <h4>
                Video Description (optional) :
            </h4>
            <b-form-textarea v-model="EmbedDescription" id="exampleFormControlTextarea1" rows="3"></b-form-textarea>
            <br>
            <submit-close-editor
                @submit="submit"
                @close="cancelEdit"
                :disabled="errors.any() || EmbedURL == '' || dimensionErrors.any()"
                type="video"
                disableMessage="Please submit a valid YouTube link."
            />
        </form>
    </div>
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import EditVideoEmbed from "./EditVideoEmbed";
import DimensionPicker from "../DimensionPicker";
import { mapGetters } from "vuex";
import SubmitCloseEditor from "../SubmitCloseEditor";

var _ = require("lodash");

export default Vue.component("edit-video-embed", {
    components: { DimensionPicker, SubmitCloseEditor},
    props: [],
    data() {
        return {
            width: 640,
            height: 480,
            title: "",
            source: "",
            EmbedURL: "",
            EmbedDescription: "",
            EmbedHeight: 480,
            includeYtData: true,
            dimensionErrors: {
                any: function() {
                    return false;
                } 
            }
        };
    },
    computed: {
        ActualDescription() {
            if (this.includeYtData) {
                return this.ytVideoDescription;
            } else {
                return this.EmbedDescri1ption;
            }
        },
        ...mapGetters([
            "ytVideoDescription",
            "ytVideoDescriptionShort",
            "ytVideoThumbnail",
            "ytVideoTitle",
            "ytVideoID"
        ])
    },
    methods: {
        DebounceSubmit: _.debounce(function() {
            this.getYoutubeData();
        }, 400),
        submit() {
            if (
                this.$route.query.index ==
                this.$store.state.create.postElements.length
            ) {
                this.$store.dispatch("addElement", this.generateEmbedJSON());
            } else {
                this.$store.dispatch("editElement", {
                    index: this.$route.query.index,
                    element: this.generateEmbedJSON()
                });
            }
        },

        getYoutubeData() {
            var self = this;
            this.$store
                .dispatch("getYoutubeVideoInfo", this.EmbedURL)
                .catch(err => console.log(err));
        },
        generateEmbedJSON() {
            var obj = {
                post: 2,
                type: "video_link",
                id: this.ytVideoID,
                url: this.EmbedURL,
                height: this.height,
                width: this.width,
                title: this.ytVideoTitle,
                thumbnail: this.ytVideoThumbnail,
                description: this.ActualDescription
            };
            this.$store.dispatch("submitVideoEmbed", obj);
            this.$router.push({ name: "create" });
            return { type: "video_link", content: obj };
        },
        cancelEdit() {
            this.$router.push({ name: "create" });
        }
    },
    mounted() {
        this.$on("changeHeight", function(h) {
            this.height = h.value;
            this.dimensionErrors = h.errors;
        });
        this.$on("changeWidth", function(w) {
            this.width = w.value;
            this.dimensionErrors = w.errors;
        });
    },
    destroyed() {
        this.$store.dispatch("clearYoutubeData");
    }
});
</script>

<style lang="scss" scoped>
.outline-danger {
    border-color: red;
    border-width: 0.1em;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
