<template>
  <div>
    <form v-on:submit.prevent="DebounceFileSubmit">
      <file-upload title="Upload Video Files" fileAcceptType="VID"></file-upload>
      <br>
      <div class="row">
        <div class="col-12">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-height">Title</span>
            </div>
            <input
              v-model="ActualTitle"
              type="text"
              class="form-control"
              name="height"
              aria-describedby="basic-height">
          </div>
        </div>
        <br><br><br>
        <div class="col-4">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-height">Height</span>
            </div>
            <input
              v-validate="'required|between:100,1024'"
              v-model="height"
              type="number"
              class="form-control"
              name="height"
              aria-describedby="basic-height">
          </div>
        </div>
        <div class="col-4">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-width">Width</span>
            </div>
            <input
              v-validate="'required|between:100,1024'"
              v-model="width"
              type="number"
              class="form-control"
              name="width"
              aria-describedby="basic-width">
          </div>
        </div>
      </div>
      <br>
      <h4>
        Video Description(s) (optional) :
      </h4>
      <textarea v-model="fileDescription" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
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
</template>

<script>
import Vue from 'vue';
import FileUpload from '../FileUpload';
import EditVideoEmbed from './EditVideoEmbed';
import { mapGetters } from 'vuex';

var _ = require("lodash");

export default Vue.component('edit-video-file', {
  components: { FileUpload },
  props: [],
  data() {
    return {
      width: 640,
      height: 480,
      title: "",
      source: "",
      fileDescription: ''
    };
  },
  computed: {
    ActualTitle: {
      get: function() {
        return this.title;
      },
      set: function(val) {
        this.title = val;
      }
    },
    ...mapGetters([
      "hasFiles",
      "allFilesUploadComplete"
    ])
  },
  methods: {
    DebounceFileSubmit: _.throttle(function() {
      this.GenerateComponentFileJSON();
    }, 1000),
    GenerateComponentFileJSON() {
      var output = new Array();
      var self = this;

      _.map(this.$store.state.fs.files, function(val, ind, arr) {
        console.log(val, ind, arr);
        output.push({
          type: "video_file",
          id: val.db_id,
          height: self.height,
          title: self.ActualTitle,
          width: self.width,
          file: val.file,
          name: val.file.name,
          url: val.url,
          description: self.fileDescription
        });
      });
      console.log(output);
      this.$store.dispatch('submitVideoFiles', output);
      return output;
    }
  },
  mounted() {

  }
});
</script>



<style lang="scss" scoped>
.fade-transition {
  transition: opacity 0.2s ease;
}

.fade-enter, .fade-leave {
  opacity: 0;
}

</style>

