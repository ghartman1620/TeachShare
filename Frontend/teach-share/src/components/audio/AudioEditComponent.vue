<template>
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
                <button type="submit" class="btn btn-primary btn-block">
                    <span>Please Select File(s) to upload</span>
                    <span>Submit Audio(s)</span>
                </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import Vue from 'vue';
import FileUpload from '../FileUpload';
import { mapGetters } from 'vuex';

var _ = require("lodash");

export default Vue.component('audio-edit-component', {
  components: { FileUpload },
  props: [],
  data() {
    return {
        title: '',
        description: ''
    };
  },
  computed: {
    
  },
  methods: {
      SubmitAudio(){
          console.log(this.title);
          console.log(this.description);
          this.$store.dispatch('submitAudioFiles', this.$store.state.fs.uploadedFiles);
      }

  },
  mounted () {

  }
});
</script>



<style lang="scss" scoped>

</style>

