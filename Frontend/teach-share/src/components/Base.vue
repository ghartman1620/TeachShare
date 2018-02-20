<template>
  <div class="container-fluid body-fluid">
    <nav-bar :query="queryParam"></nav-bar>
    <router-view/>
    <file-component>Some text!</file-component>
  </div>
</template>

<script>
import Vue from 'vue';
import Navbar from './Navbar';
import FileComponent from './FileComponent.vue';


export default Vue.component('base-page', {
    components: { FileComponent },
    props: ['items'],
    data() {
      return {
        queryParam: "",
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
