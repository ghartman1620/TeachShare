<template>
<div class="row">
  <div class="col-1"></div>
  <div class="col">
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
      <form v-on:submit.prevent="TestYoutube">
        <div class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text" id="basic-addon3">Embed URL</span>
          </div>
          <input
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
        <br>
        <h4>
          Video Description (optional) :
        </h4>
        <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
        <br>
        <div class="row">
          <div class="offset-3 col-6">
            <button type="submit" :disabled="EmbedURL.length <= 0" class="btn btn-primary btn-block">
              <span v-if="EmbedURL.length">Submit Video Link</span>
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
      <file-upload title="Upload Video Files" fileAcceptType="VID"></file-upload>
       <br>
       <div class="row">
          <div class="offset-3 col-6">
            <button type="button" :disabled="hasFiles" class="btn btn-primary btn-block">
              <span v-if="hasFiles">Please Select File(s) to upload</span>
              <span v-else>Submit Video(s)</span>
            </button>
          </div>
        </div>
    </div>
    </div>
    </div>
    </div>
  </div>
  <!-- <div class="col-1"></div> -->
  <div class="container">
    <br>
    {{errors}}
    <br><br>
    <div class="row">
      <div class="media">
        <img class="mr-3" :src="videoThumbnail.url" alt="Generic placeholder image">
        <div class="media-body">
          <h5 class="mt-0">media title</h5>
            {{videoDescription}}
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Vue from 'vue';
import FileUpload from '../FileUpload';
import { mapGetters } from 'vuex';

export default Vue.component('edit-video', {
    components: { FileUpload },
    props: [],
    data() {
      return {
        'id': null,
        'isEmbed': null,
        'isFile': false,
        'autoplay': false,
        'width': null,
        'height': null,
        'controls': false,
        'title': '',
        'source': '',
        'link': '',
        'playlist': '',
        'loop': false,
        'EmbedURL': ''
      }
    },
    computed: {
      ...mapGetters([
        'hasFiles',
        'videoDescription',
        'videoThumbnail'
      ])
    },
    methods: {
      TestYoutube(){
        this.$store.dispatch('getYoutubeVideoInfo', this.EmbedURL)
      }
    }
  })
</script>



<style lang="scss" scoped>
.outline-danger {
  border-color: red;
  border-width: 0.1em;
}


</style>

