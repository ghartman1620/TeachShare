<template>
<div>
  <div class="card" :style="{width: cardWidth + 'px', padding: '10px'}">
    <video
      class="align-items-center"
      :id="id"
      :src="source"
      :autoplay="autoplay"
      :width="width"
      :height="height"
      :controls="controls"
    >
    </video>
    <div class="card-body">
      <h5 class="card-title">{{ title }}</h5>
      <p class="card-text">
        <slot>
          There was no content provided.
        </slot>
      </p>
      <a href="#" class="btn btn-primary justify-center">Go somewhere</a>
    </div>
  </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.component('file-video', {
    props: [
      'id',
      'title',
      'width',
      'height',
      'controls',
      'source',
      'filetype',
      'autoplay',

    ],
    data() {
      return {
        video: null,

      }
    },
    computed: {

    },
    mounted: function(){
      this.video = document.getElementById(this.id);
    },
    methods: {
      // basic play functionality (not needed)
      Play() {
        console.log('play');
        this.video.play();

      },
      Pause() {
        console.log('pause');
        this.video.pause();
      }
    }
  })
</script>
