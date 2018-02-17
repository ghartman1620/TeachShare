<template>
  <form class="form-inline my-2 my-lg-0">
    <input class="form-control mr-sm-2" type="search" v-model="query" placeholder="Search" aria-label="Search">
    <button class="btn btn-outline-light" type="submit"><img class="search-button" src="/static/grey-search.png"></button>
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

<style>
  .search-button {
    height: 20px;
    width: auto;
  }
</style>
