<template>
    <div>
        <h1>Video Links</h1>
        <p>
            Enter the embed url here
        </p>
        <form v-on:submit.prevent="submit">
            <div class="input-group mb-3">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="basic-addon3">Embed URL</span>
                </div>
                <input
                    v-on:input="debounceSubmit"
                    v-validate="'required|url|YoutubeEmbedURL'"
                    :class="{'input': true, 'outline-danger': errors.has('embedurl') }"
                    v-model="EmbedURL"
                    type="text"
                    class="form-control"
                    name="embedurl"
                    aria-describedby="basic-addon3">
            </div>
                <span v-show="errors.has('embedurl')" class="help text-danger">{{ errors.first('embedurl') }}</span>
            <br>
            <transition name="fade">
                <div v-if="ytVideoDescription || ytVideoThumbnail || ytVideoTitle" class="row">
                    <!-- <div class="col-1"></div> -->
                    <div class="col">
                        <div class="media">
                            <img class="mr-3" :src="ytVideoThumbnail.url" alt="Generic placeholder image">
                            <div class="media-body">
                                <h5 class="mt-0">{{ ytVideoTitle }}</h5>
                                    {{ytVideoDescriptionShort}}
                            </div>
                        </div>
                    <div class="col-1"></div>
                    <br>
                    <div class="row">
                        <!-- dimension picker -->
                        <div class="col-8">
                            <dimension-picker></dimension-picker>
                        </div>
                        <div class="col-4">
                            <input v-model="includeYtData" class="form-check-input" type="checkbox" value="" id="ytcheck">
                            <label class="form-check-label" for="ytcheck">
                                <h5>Include YouTube Video Information</h5>
                            </label>
                        </div>
                    </div>
                    </div>
                </div>
            </transition>
            <br> 
            <h4>
                Video Description (optional) :
            </h4>
            <textarea v-model="EmbedDescription" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
            <br>
            <div class="row">
                <div class="offset-3 col-6">
                    <button type="submit" :disabled="errors.any() || EmbedURL == '' || dimensionErrors.any()" class="btn btn-primary btn-block">
                        <span v-if="!errors.any() && title !== ''">Submit Video Link</span>
                        <span v-else>Please enter a valid link</span>
                    </button>
                </div>
                <div class="col-2">
                        <button type="button" class="btn btn-danger btn-block" @click.prevent="cancelEdit">
                                Cancel
                        </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import FileUpload from "../FileUpload.vue";
import DimensionPicker from "../DimensionPicker.vue";
import { mapGetters } from "vuex";
import debounce from "lodash/debounce";
import { getVideoInfo, clearVideoInfo, } from "../../store_modules/YouTubeService";

var _ = require("lodash");

@Component({
    name: "edit-video-embed",
    components: { DimensionPicker },
    props: [],
    computed: mapGetters([
            "ytVideoDescription",
            "ytVideoDescriptionShort",
            "ytVideoThumbnail",
            "ytVideoTitle",
            "ytVideoID"
    ])
})
export default class EditVideoEmbed extends Vue {
    ytVideoDescription!: string ;
    ytVideoID!: string;
    ytVideoTitle!: string;
    ytVideoThumbnail!: any;

    width: number = 640;
    height: number = 480;
    title: string = "";
    source: string = "";
    EmbedURL: string = "";
    EmbedDescription: string = "";
    EmbedHeight: number = 480;
    includeYtData: boolean = true;
    dimensionErrors: any = {
        any: function() {
            return false;
        }
    };

    get actualDescription() {
        if (this.includeYtData) {
            return this.ytVideoDescription;
        } else {
            return this.EmbedDescription;
        }
    }

    debounceSubmit() {
        this.getYoutubeData();
        var vm = this;
        debounce(function() {
            vm.getYoutubeData();
        }, 400);
    }
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
    }

    async getYoutubeData(input: string = this.EmbedURL) {
        try {
            let resp = await getVideoInfo(this.$store, input);
            return resp;
        } catch (err) {
            console.log(err);
            return err;
        }
    }
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
            description: this.actualDescription
        };
        this.$store.dispatch("submitVideoEmbed", obj);
        this.$router.push({ name: "create" });
        return { type: "video_link", content: obj };
    }
    cancelEdit() {
        this.$router.push({ name: "create" });
    }
    mounted() {
        var vm = this;
        this.$on("changeHeight", function(h) {
            vm.height = h.value;
            vm.dimensionErrors = h.errors;
        });
        this.$on("changeWidth", function(w) {
            vm.width = w.value;
            vm.dimensionErrors = w.errors;
        });
    }
    destroyed() {
        clearVideoInfo(this.$store);
    }
}
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
