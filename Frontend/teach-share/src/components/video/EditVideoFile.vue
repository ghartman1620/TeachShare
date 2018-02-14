<template>
  <div>
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
</template>

<script>
import Vue from 'vue';
import FileUpload from '../FileUpload';
import EditVideoEmbed from './EditVideoEmbed';
import { mapGetters } from 'vuex';

var _ = require("lodash");

export default Vue.component('edit-video', {
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
      submitted: false
    };
  },
  computed: {
    DescriptionEmbed(){
      return this.$store.state.video.newVideos[0].description;
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
.fade-transition {
  transition: opacity 0.2s ease;
}

.fade-enter, .fade-leave {
  opacity: 0;
}

</style>

