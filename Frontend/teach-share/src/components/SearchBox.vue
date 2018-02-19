<template>
  <form class="form-inline my-2 my-lg-0">
    <input class="form-control mr-sm-2" type="search" v-model="query" placeholder="Search" aria-label="Search">
    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
  </form>
</template>

<script>
import Vue from 'vue';

export default Vue.component('search-box', {
    props: ['query'],
    data() {
      return {

      }
    }
  })
</script>
<!---->