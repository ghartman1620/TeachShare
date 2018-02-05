
<template>
<body>
  <div id="app">
    <router-view/>
    <h1></h1>
    <div class="navbar">
      <form>
        <div class="searchbar">
          <input type="search" id="mySearch" name="q"
                 placeholder="Search...">
        </div>
      </form>

    </div>

  </div>
</body>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import '../node_modules/bootstrap/scss/bootstrap.scss';
</style>

<style>
  .navbar {
    width: 100%;
    height: 10%;
    background-color:#65A98F;
  }
  .navbar .q {
    width: 50%;
  }


body{
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>


<!--

<template>
  <div class="container">
    <nav-bar :query="queryParam"></nav-bar>-->
    <!-- This can be used as a template -->
    <!-- insert content here for pages,
    components will have to be separate of course -->
<!--
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
-->
