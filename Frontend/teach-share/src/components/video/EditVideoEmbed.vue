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
                    v-on:input="getYoutubeData"
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
import Vue from "vue";
import FileUpload from "../FileUpload";
import DimensionPicker from "../DimensionPicker";
import { mapGetters } from "vuex";
import { Component } from "vue-property-decorator";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

var _ = require("lodash");

@Component({
    name: "edit-video-embed",
    components: {DimensionPicker}
})
export default class EditVideoEmbed extends Vue{
    @Getter("ytVideoDescription") ytVideoDescription;
    @Getter("ytVideoDescriptionShort") ytVideoDescriptionShort;
    @Getter("ytVideoThumbnail") ytVideoThumbnail;
    @Getter("ytVideoTitle") ytVideoTitle;
    @Getter("ytVideoID") ytVideoID;

    width:number =  640;
    height: number = 480;
    title: string = "";
    source:  string = "";
    EmbedURL: string = "";
    EmbedDescription: string = "";
    EmbedHeight: number = 480;
    includeYtData: boolean = true;
    dimensionErrors: any = {
        any: function() {
            return false;
        } 
    };

    get ActualDescription() {
        if (this.includeYtData) {
            return this.ytVideoDescription;
        } else {
            return this.EmbedDescription;
        }
    }

    //this doesnt work and I changed @Input to getYoutubeData instead of this debounce function. 
    DebounceSubmit(){ var vm: EditVideoEmbed = this;
        _.debounce(function() {
        vm.getYoutubeData();
    }, 400)}
    submit() {
        this.$parent.$emit("submitElement", this.generateEmbedJSON(), this.$route.query.index);
    }

    getYoutubeData() {
        var self = this;
        this.$store
            .dispatch("getYoutubeVideoInfo", this.EmbedURL)
            .catch(err => console.log(err));
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
            description: this.ActualDescription
        };
        this.$store.dispatch("submitVideoEmbed", obj);
        this.$router.push({ name: "create" });
        return { type: "video_link", content: obj };
    }
    cancelEdit() {
        this.$router.push({ name: "create" });
    }
    mounted() {
        var vm: EditVideoEmbed = this;
        vm.$on("changeHeight", function(h) {
            vm.height = h.value;
            vm.dimensionErrors = h.errors;
        });
        vm.$on("changeWidth", function(w) {
            vm.width = w.value;
            vm.dimensionErrors = w.errors;
        });
    }
    destroyed() {
        this.$store.dispatch("clearYoutubeData");
    }
};
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
