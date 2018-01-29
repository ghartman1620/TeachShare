
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

<style>
body{
  background: #FCF4E3;
  background: -webkit-linear-gradient(right, #76b852, #8DC26F);
  background: -moz-linear-gradient(right, #76b852, #8DC26F);
  background: -o-linear-gradient(right, #76b852, #8DC26F);
  background: linear-gradient(to left, #76b852, #8DC26F);
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>


