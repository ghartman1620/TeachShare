<template>
<div v-if="isEmbed">
  <p>Embeded video</p>
  <embed-video></embed-video>
</div>
<div v-else-if="isFile">
  <p>Video File</p>
  <file-video
    id="10"
    width="500"
    controls="true"
    title="Wierd movie thingy.."
    source="https://www.w3schools.com/html/mov_bbb.mp4"
    link="https://www.w3schools.com/html/mov_bbb.mp4"
    autoplay="true">
    This is where you would put a long (or short) section of text to explain a video.
  </file-video>
</div>
<div v-else>
  <p>Something went wrong...</p>
</div>

</template>

<script>
import Vue from 'vue';
import EmbedVideo from './EmbedVideo.vue';
import FileVideo from './FileVideo.vue';

export default Vue.component('video-component', {
    components: { EmbedVideo, FileVideo },
    props: ['isEmbed', 'isFile'],
    data() {
      return {

      }
    }
  })
</script>
