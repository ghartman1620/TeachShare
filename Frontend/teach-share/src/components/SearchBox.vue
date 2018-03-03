<template>
    <form class="form-inline my-2 my-lg-0">
        <input id="searchBoxInput" class="form-control mr-sm-2" type="search" v-model="query" placeholder="what are you looking for?" aria-label="Search">
        <button id="searchBoxBtn" class="btn btn-dark my-2 my-sm-0" type="submit"><img class="search-img" src="/static/grey-search.png"> <strong>Search</strong></button>
    </form>
</template>

<script>
import Vue from "vue";

export default Vue.component("search-box", {
    props: ["query"],
    data() {
        return {

        }
    }
  })
</script>

<style>
.search-img {
    height: 20px;
    width: 20px;
}

</style>
