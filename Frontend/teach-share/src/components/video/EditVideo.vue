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

    <div v-if="this.$store.state.video.videos.length > 0"
      v-bind:style="styleObject"
      class="">
      <div :key="v.id" v-for="v in this.$store.state.video.videos">
        <div v-if="v.type === 'video_link'">
          <video-component
            name="vid-comp1"
            :id="v.id"
            :height="v.height"
            :width="v.width"
            :title="v.title"
            :source="v.url"
            controls="true"
            autoplay="false"
            isEmbed=true>
          <div slot="description">{{v.description}}</div>
          </video-component>
        </div>
          <div v-else>
          <video-component
            name="vid-comp2"
            :id="v.id"
            :height="v.height"
            :width="v.width"
            :title="v.title"
            :source="v.url"
            controls="true"
            autoplay="false"
            isFile=true>
          <div slot="description">{{v.description}}</div>
          </video-component>
        </div>

      </div>
    </div>
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
      }
    };
  },
  computed: {
    DescriptionEmbed(){
      return this.$store.state.video.videos[0].description;
    },
    DescriptionFile(){
      return this.$store.state.video.videos[0].description;
    },
    RemovedFile() {
      var vm = this;
      this.$on('RemoveItem', function(item){
        console.log('Removed: ', item);
        vm.$dispatch('removeVideo', item);
      });
    }
  },
  methods: {


  },
  mounted () {
    this.$nextTick(() => {
      // let h = this.$children[4].$el.clientHeight;
      // this.styleObject['max-height'] = 500;
      // console.log('CLIENT HEIGHT: ', h);

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

