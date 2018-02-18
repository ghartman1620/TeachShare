<!--
This component views a single post component. Used in PostCreate and PostFeed.
Uses ViewText, ViewVideo, etc.
-->

<template>
<body>
  <div class="row">

  <div class="col-10"> <!-- col-11 -->
  <div class="post-component card" v-if="component.type === 'text'">
    <view-text :component="component"></view-text>

  </div>
  <div class="post-component card" v-else-if="component.type === 'image_file'">
    <image-component :title="component.title" :body="component.description" :images="component.content"/>
  </div>
  <div class="post-component card" v-else-if="component.type === 'audio'">
    <audio-component :id="component.content[0].id" 
    :title="component.content[0].title" 
    :body="component.content[0].description" 
    :controls="true" :source="component.content[0].url" 
    :filetype="component.content[0].filetype" 
    autoplay="false"/>
  </div>

  <div class="post-component card" v-else-if="component.type === 'video_link' || component.type === 'video_file'">
      <div v-if="component.type === 'video_link'">
          <video-component
            name="vid-comp1"
            :id="component.content.id"
            :height="component.content.height"
            :width="component.content.width"
            :title="component.content.title"
            :source="component.content.url"
            controls="true"
            autoplay="false"
            isEmbed=true>
          <div slot="description">{{component.content.description}}</div>
          </video-component>
        </div>
        <div v-else>
          <video-component
            name="vid-comp2"
            :id="component.content.id"
            :height="component.content.height"
            :width="component.content.width"
            :title="component.content.title"
            :source="component.content.url"
            controls="true"
            autoplay="false"
            isFile=true>
          <div slot="description">{{component.content.description}}</div>
          </video-component>
       </div>
  </div>
  <div class="post-component card" v-else-if="component.type === 'file'">
    <p>A file component!</p>  `
  </div>
  </div>
  </div>
</body>
</template>

<script>
import Vue from "vue";
import ViewText from "./ViewText"
//add other view components as appropriate

export default Vue.component("post-component", {
    props: ['component'],
});
</script>