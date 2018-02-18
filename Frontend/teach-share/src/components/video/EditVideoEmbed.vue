<template>
  <div>
    <h1>Video Links</h1>
    <p>
      Enter the embed url here
    </p>
    <form v-on:submit.prevent="generateComponentEmbedJSON">
      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon3">Embed URL</span>
        </div>
        <input
          v-on:input="DebounceSubmit"
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
          <button type="submit" :disabled="errors.any() || EmbedURL == ''" class="btn btn-primary btn-block">
            <span v-if="!errors.any()">Submit Video Link</span>
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

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import EditVideoEmbed from "./EditVideoEmbed";
import DimensionPicker from "../DimensionPicker";
import { mapGetters } from "vuex";

var _ = require("lodash");

export default Vue.component("edit-video-embed", {
  components: { DimensionPicker },
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
      includeYtData: true
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

    getYoutubeData() {
      var self = this;
      this.$store
        .dispatch("getYoutubeVideoInfo", this.EmbedURL)
        .catch(err => console.log(err));
    },
    generateComponentEmbedJSON() {
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
      console.log(obj);
      return { type: "video_link", content: obj };
    },
    cancelEdit() {
      this.$router.push({ name: "create" });
    }
  },
  mounted() {
    this.$on("changeHeight", function(h) {
      this.height = h;
    });
    this.$on("changeWidth", function(w) {
      this.width = w;
    });
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
