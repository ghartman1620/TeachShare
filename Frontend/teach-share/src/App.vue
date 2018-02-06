<template>
  <body>
  <div id="app">
    <router-view/>
    <h1></h1>

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
