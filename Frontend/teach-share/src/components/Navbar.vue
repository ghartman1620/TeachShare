<template>
  <nav class="navbar fixed-top navbar-inverse navbar-expand-lg navbar-dark bg-custom-colors">

    <!-- brand section -->
    <router-link class="navbar-brand" to="/">TeachShare</router-link>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <img src="../assets/logo-red-and-white.png" class="img-responsive pull-right" >
      <ul class="navbar-nav mr-auto">

        <!-- home link -->
        <li class="nav-item active">
          <router-link class="nav-link" to="/base">Home <span class="sr-only">(current)</span></router-link>
        </li>

        <!-- create a post link -->
        <li class="nav-item">
          <router-link class="nav-link" to="/create">Create Post</router-link>
        </li>

        <!-- just an example dropdown -->
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Dropdown example
          </a>
          <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <a class="dropdown-item" href="#">Action</a>
            <a class="dropdown-item" href="#">Another action</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#">Something else here</a>
          </div>
        </li>
      </ul>

      <!-- search box component -->
      <search-box></search-box>
    </div>
  </nav>
</template>

<script>
import Vue from 'vue';
import SearchBox from './SearchBox.vue';

export default Vue.component('nav-bar', {
    components: SearchBox,
    props: ['query'],
    data() {
      return {

      }
    }
  })
</script>


<style scoped lang="scss">
.bg-custom-colors {
  background-color: #65A98F;
}

// this is an example, not an end result
.router-link-exact-active {
  text-decoration: underline;
  text-decoration-style: solid;
  text-decoration-color: #46E;
}


</style>
