<template>
<div>
  <div class="card" :style="{width: cardWidth + 'px', padding: '10px'}">

    <video
      class="align-self-start mr-5"
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
  <!-- <div class="row">
    <div class="p-1">
      <button @click.prevent="Play">Play |></button>
    </div>
    <div class="p-1">
      <button @click.prevent="Pause">Pause ||</button>
    </div>
  </div> -->
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
      cardWidth: function() { return parseInt(this.width) + 20 },
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
