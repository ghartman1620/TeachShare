<template>
<div class="row d-flex justify-content-md-center justify-content-start">
<div v-if="isEmbed">
  <embed-video
    :source="source"
    :width="width"
    :height="height"
    :playlist="playlist"
    :loop="loop"
    :controls="controls"
    :title="title"
    :autoplay="autoplay">
    <slot name="description"></slot>
  </embed-video>
</div>
<div v-else-if="isFile">
  <p>Video File</p>
  <file-video
    :id="id"
    :width="width"
    :height="height"
    :controls="controls"
    :title="title"
    :source="source"
    :link="link"
    :autoplay="autoplay">
  </file-video>
</div>
<div v-else>
  <p>Something went wrong...</p>
</div>
</div>
</template>

<script>
import Vue from "vue";
import EmbedVideo from "./EmbedVideo.vue";
import FileVideo from "./FileVideo.vue";

export default Vue.component("video-component", {
  components: { EmbedVideo, FileVideo },
  props: [
    "id",
    "isEmbed",
    "isFile",
    "autoplay",
    "width",
    "height",
    "controls",
    "title",
    "source",
    "link",
    "playlist",
    "loop"
  ],
  data() {
    return {};
  }
});
</script>
