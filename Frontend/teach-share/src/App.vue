<!--Very very barebones. This will be improved shortly! -JL -->

<template>
<body>
  <div id="app">
    <router-view/>
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

body{
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
