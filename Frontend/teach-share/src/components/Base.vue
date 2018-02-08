<template>
  <div class="container-fluid body-fluid">
    <nav-bar :query="queryParam"></nav-bar>
    <!-- This can be used as a template -->
    <!-- insert content here for pages,
    components will have to be separate of course -->
    <!-- <video-component :isFile="true"></video-component> -->
    <slot name="body"></slot>
    <div class="row">
      <file-upload uploadFieldName="files"></file-upload>
    </div>
    <!-- <div class="row">
      <video-component :isFile="true"></video-component>
    </div> -->
  </div>
</template>

<script>
import Vue from 'vue';
import Navbar from './Navbar'
import VideoComponent from './video/VideoComponent.vue';
import FileUpload from './FileUpload.vue';

export default Vue.component('base-page', {
    components: { Navbar, VideoComponent, FileUpload },
    props: ['items'],
    data() {
      return {
        queryParam: ""
      }
    }
  })
</script>

<style lang="scss" scoped>

// Adds some padding to the main body, so that it's not underneath the navbar
.body-fluid {
  position: relative;
  padding-top: 100px;
}

</style>
