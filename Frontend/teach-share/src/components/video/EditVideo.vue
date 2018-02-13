<template>
<div class="row">
  <div class="col-xl-2 col-sm-1"></div>
  <div class="col-xl-8 col-sm-10 col-xs-12">
    <div class="card">

    <nav>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <router-link class="nav-item nav-link active"
        id="nav-home-tab"
        data-toggle="tab"
        href="#nav-home"
        to=""
        role="tab"
        aria-controls="nav-home"
        aria-selected="true">
          Video Link (YouTube, Vimeo, etc...)
      </router-link>
      <router-link class="nav-item nav-link"
        id="nav-profile-tab"
        data-toggle="tab"
        href="#nav-profile"
        to=""
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
      <h1>Video Links</h1>
      <p>
        Enter the embed url here
      </p>
      <form>
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
        <div v-if="ytVideoDescription || ytVideoThumbnail || ytVideoTitle" class="row">
          <div class="col-1"></div>
          <div class="col">
            <div class="media">
              <img class="mr-3" :src="ytVideoThumbnail.url" alt="Generic placeholder image">
              <div class="media-body">
                <h5 class="mt-0">{{ ytVideoTitle }}</h5>
                  {{ytVideoDescription}}
              </div>
            </div>
          <div class="col-1"></div>
          <br>
          <div class="row">
            <div class="col-6"></div>
            <div class="col-6">
              <input v-model="includeYtData" class="form-check-input" type="checkbox" value="" id="ytcheck" required>
              <label class="form-check-label" for="ytcheck">
                <h5>
                  Include YouTube Video Information
                </h5>
              </label>
            </div>
          </div>
          </div>
        </div>
       
        <br>
        <h4>
          Video Description (optional) :
        </h4>
        <textarea v-model="EmbedDescription" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
        <br>
        <div class="row">
          <div class="offset-3 col-6">
            <button type="button" @click="GenerateComponentEmbedJSON" :disabled="errors.any() || EmbedURL == ''" class="btn btn-primary btn-block">
              <span v-if="!errors.any()">Submit Video Link</span>
              <span v-else>Please enter a valid link</span>
            </button>
          </div>
        </div>
      </form>
    </div>
    <div class="tab-pane fade"
      id="nav-profile"
      role="tabpanel"
      aria-labelledby="nav-profile-tab">
      <form v-on:submit.prevent="DebounceFileSubmit">
      <file-upload title="Upload Video Files" fileAcceptType="VID"></file-upload>
       <br>
       <div class="row">
          <div class="offset-3 col-6">
            <button type="submit" :disabled="!hasFiles && allFilesUploadComplete" class="btn btn-primary btn-block">
              <span v-if="!hasFiles">Please Select File(s) to upload</span>
              <span v-else>Submit Video(s)</span>
            </button>
          </div>
        </div>
      </form>
    </div>
    </div>
    </div>
    </div>
  </div>
  <div class="col-xl-2 col-sm-1"></div>
  <div class="container">
    <br>
    {{errors}}
    <br><br>
    <div v-if="submitted">
      <video-component
        height=480
        width=640
        :title="this.ytVideoTitle"
        :source="this.EmbedURL"
        isEmbed=True>
      {{ActualDescription}}
      </video-component>
    </div>
  </div>
</div>
</template>

<script>
import Vue from "vue";
import FileUpload from "../FileUpload";
import { mapGetters } from "vuex";

var _ = require("lodash");

export default Vue.component("edit-video", {
  components: { FileUpload },
  props: [],
  data() {
    return {
      id: null,
      isEmbed: null,
      isFile: false,
      autoplay: false,
      width: null,
      height: null,
      controls: false,
      title: "",
      source: "",
      link: "",
      playlist: "",
      loop: false,
      EmbedURL: "",
      EmbedDescription: "",
      includeYtData: true,
      submitted: false
    };
  },
  computed: {
    ActualDescription() {
      if (this.includeYtData) {
        return this.ytVideoDescription;
      } else {
        return this.EmbedDescription;
      }
    },
    ...mapGetters([
      "hasFiles",
      "ytVideoDescription",
      "ytVideoThumbnail",
      "ytVideoTitle",
      "allFilesUploadComplete"
    ])
  },
  methods: {
    DebounceSubmit: _.debounce(function() {
      this.GetYoutubeData();
    }, 400),
    DebounceFileSubmit: _.throttle(function() {
      this.GenerateComponentFileJSON();
    }, 1000),

    GetYoutubeData() {
      var self = this;
      this.$store
        .dispatch("getYoutubeVideoInfo", this.EmbedURL)
        .catch(err => console.log(err));
    },
    GenerateComponentEmbedJSON() {
      var obj = {
        post: 2,
        type: "link",
        url: this.EmbedURL,
        title: this.ytVideoTitle,
        thumbnail: this.ytVideoThumbnail,
        description: this.ActualDescription
      };
      console.log(obj);
      this.submitted = true;
      return obj;
    },
    GenerateComponentFileJSON() {
      var output = new Array();

      _.map(this.$store.state.fs.files, function(val, ind, arr) {
        console.log(val, ind, arr);
        output.push({
          type: "video_file",
          id: val.db_id,
          file: val.file,
          name: val.file.name,
          url: val.url
        });
      });
      console.log(output);
      return output;
    }
  }
});
</script>



<style lang="scss" scoped>
.outline-danger {
  border-color: red;
  border-width: 0.1em;
}
</style>

