<template>
    <div>
        <div class="container">
            <form v-on:submit.prevent="SubmitAudio">

                <!-- file upload -->
                <file-upload :fileLimit="1" title="Upload Audio Files" fileAcceptType="AUD"></file-upload>
                <br><br>
                
                <!-- Title -->
                <div class="row">
                    <div class="col-12">
                    <div class="input-group">
                        <div class="input-group-prepend">
                        <span class="input-group-text" id="basic-height">Title</span>
                        </div>
                        <input
                        v-model="title"
                        type="text"
                        class="form-control"
                        name="height"
                        aria-describedby="basic-height">
                    </div>
                    </div>
                    <br><br><br>
                </div>
                <br>
                <h4>Audio Description(s) (optional):</h4>

                <!-- Description -->
                <textarea v-model="description" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                <br>
                <div class="row">
                <div class="offset-3 col-6">
                    <button type="submit" :disabled="!allFilesUploadComplete" class="btn btn-primary btn-block">
                        <span v-if="!allFilesUploadComplete">Please Select File(s) to upload</span>
                        <span v-else>Submit Audio(s)</span>
                    </button>
                    </div>
                </div>
            </form>
        </div>
        <br>
        <br>
        <div class="row">
            <div class="col-2"></div>
            <div class="col-8" v-if="this.$store.state.audio.audio.length > 0">
                <div :key="a.id" v-for="a in this.$store.state.audio.audio">
                    <audio-component 
                        :autoplay="false"
                        :controls="true"
                        :filetype="a.file.type"
                        :id="a.id"
                        :body="description"
                        :title="title"
                        :source="a.url">

                    </audio-component>
                </div>
            </div>
            <div class="col-2"></div>
        </div>
        <br><br>
    </div>
</template>

<script>
import Vue from 'vue';
import FileUpload from '../FileUpload';
import { mapGetters } from 'vuex';
import AudioComponent from './AudioComponent';

var _ = require("lodash");

export default Vue.component('audio-edit-component', {
  components: { FileUpload, AudioComponent },
  props: [],
  data() {
    return {
        title: '',
        description: ''
    };
  },
  computed: {
    changedTextRecv() {
        
    },
    ...mapGetters(['hasFiles', 'allFilesUploadComplete'])
  },
  methods: {
      SubmitAudio() {
          console.log(this.title);
          console.log(this.description);
          this.$store.dispatch('submitAudioFiles', this.GenerateJSON());
      },
      GenerateJSON() {
          let output = new Array();
          var vm = this;
          _.map(this.$store.state.fs.uploadedFiles, function(val, ind, arr) {
            console.log(val, ind, arr);
            output.push({
                post: 2,
                type: 'audio_file',
                id: val.db_id,
                title: vm.title,
                file: val.file,
                name: val.file.name, 
                url: val.url,
                description: vm.description
            });
        });
        console.log(output);
        return output;
      }
  },
  created () {
    this.$on('changedTitle', function(res) {
            console.log('CHANGED!!!', res);
            this.title = res;
    });
    this.$on('changedBody', function(res) {
        console.log('CHANGED!!!', res);
        this.description = res;
    });
  }
});
</script>



<style lang="scss" scoped>

</style>

