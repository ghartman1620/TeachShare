<template>
  <div>
    <form v-on:submit.prevent="DebounceFileSubmit">
      <file-upload :fileLimit="1" title="Upload Video Files" fileAcceptType="VID"></file-upload>
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
        <div class="col-12">
          <br>
          <!-- dimension picker -->
          <dimension-picker></dimension-picker>
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
          <button type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
            <span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
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
import DimensionPicker from '../DimensionPicker';
import { mapGetters } from 'vuex';

var _ = require('lodash');

export default Vue.component('edit-video-file', {
  components: { FileUpload, DimensionPicker },
  props: [],
  data() {
    return {
      width: 640,
      height: 480,
      title: "",
      source: "",
      fileDescription: ""
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
    ...mapGetters(['hasFiles', 'allFilesUploadComplete'])
  },
  methods: {
    DebounceFileSubmit: _.throttle(function() {
      this.GenerateComponentFileJSON();
    }, 1000),
    GenerateComponentFileJSON() {
      var output = new Array();
      var self = this;

      _.map(this.$store.state.fs.uploadedFiles, function(val, ind, arr) {
        console.log(val, ind, arr);
        output.push({
          post: 2,
          type: 'video_file',
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
      console.log('data being submitted: ', output);
      this.$store.dispatch('submitVideoFiles', output).then(()=> {
        console.log('completed submit');
        // this.$store.dispatch('removeNewVideos');
      });
      return output;
    }
  },
  mounted() {
    this.$on('changeHeight', function(h) {
      this.height = h;
    });
    this.$on('changeWidth', function(w){
      this.width = w;
    });
  }
});
</script>



<style lang="scss" scoped>
.fade-transition {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave {
  opacity: 0;
}
</style>

