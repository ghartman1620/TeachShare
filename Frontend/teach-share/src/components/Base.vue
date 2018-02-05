<template>
  <div class="container">
    <nav-bar :query="queryParam"></nav-bar>
    <!-- This can be used as a template -->
    <!-- insert content here for pages,
    components will have to be separate of course -->

  </div>
</template>

<script>
import Vue from 'vue';
import Navbar from '@/components/Navbar'

export default Vue.component('base-page', {
    components: Navbar,
    props: ['items'],
    data() {
      return {
        queryParam: ""
      }
    }
  })
</script>
