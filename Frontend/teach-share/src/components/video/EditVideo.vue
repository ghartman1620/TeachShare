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
        <!-- video embed -->
        <edit-video-embed></edit-video-embed>
      </div>
      <div class="tab-pane fade"
        id="nav-profile"
        role="tabpanel"
        aria-labelledby="nav-profile-tab">
          <!-- video file -->
          <edit-video-file></edit-video-file>
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

    <div class="container">
    <transition name="fade">
    <div v-if="this.$store.state.video.newVideos.length > 0"
      v-bind:style="styleObject"
      class="">
      <video-component

        name="vid-comp"
        :height="this.$store.state.video.newVideos[0].height"
        :width="this.$store.state.video.newVideos[0].width"
        :title="this.$store.state.video.newVideos[0].title"
        :source="this.$store.state.video.newVideos[0].url"
        isEmbed=True>
      <div slot="description">{{DescriptionEmbed}}</div>
      </video-component>

    </div>
    </transition>
    </div>
    <br><br><br>

  </div>
</div>
</template>

<script>
import Vue from 'vue';
import EditVideoEmbed from './EditVideoEmbed';
import EditVideoFile from './EditVideoFile';
import { mapGetters } from 'vuex';

var _ = require("lodash");

export default Vue.component('edit-video', {
  components: { EditVideoFile, EditVideoEmbed },
  props: [],
  data() {
    return {
      styleObject: {
        'max-height': 100
      },

    };
  },
  computed: {
    DescriptionEmbed(){
      return this.$store.state.video.newVideos[0].description;
    }
  },
  methods: {

  },
  mounted () {
    this.$nextTick(() => {
      let h = this.$children[4].$el.clientHeight;
      this.styleObject['max-height'] = 500;
      console.log('CLIENT HEIGHT: ', h);

    })
  }
});
</script>



<style lang="scss" scoped>
.video-component {
  height: 100px;
}

.fade-transition {
  backface-visibility: hidden;
  transition: opacity 0.2s ease;
}

.fade-enter, .fade-leave {
  backface-visibility: hidden;
  opacity: 0;
}

</style>

