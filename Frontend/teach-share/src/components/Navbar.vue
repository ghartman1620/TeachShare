<template>
  <nav class="navbar fixed-top navbar-inverse navbar-expand-lg navbar-dark dark-green">
      <div class="container">
      <!-- brand section -->
      <router-link class="navbar-brand" to="/"><img class="img-responsive ts-logo" src="/static/tslogo.png"></router-link>

      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">


          <!-- create a post link -->
          <li class="nav-item">
            <router-link class="nav-link" to="/create">Create Post</router-link>
          </li>

          <!-- just an example dropdown -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="Account Profile" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              Profile
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
              <a class="dropdown-item" href="#">Your post feed</a>
              <a class="dropdown-item" href="#">Your posts</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Account details</a>
            </div>
          </li>
        </ul>

        <!-- search box component -->
        <div class="search-container">
            <input type="text" placeholder="Search.." name="search">
            <button type="button"> <!--class="btn btn-outline-basic"--><img class="img search-button" src="/static/search.svg"></button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import Vue from "vue";
import SearchBox from "./SearchBox.vue";

export default Vue.component("nav-bar", {
  components: { SearchBox },
  props: ["query"],
  data() {
    return {};
  }
});
</script>


<style lang="scss" scoped>
// this is an example, not an end result
.router-link-exact-active {
  text-decoration: underline;
  text-decoration-style: solid;
  text-decoration-color: #46e;
}
.nav {
  height: 100px;
}
.dark-green {
  background-color: #3b896a;
}
.ts-logo {
  height: 45px;
  width: auto;
}
.search-button {
  height: 20px;
  width: auto;
}
</style>
