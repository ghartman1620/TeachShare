<!--Very very barebones. This will be improved shortly! -JL -->

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
  background: #e5ffee;
  /*background: -webkit-linear-gradient(right, #e5ffee, #e5ffee); Might be cool to use later, or for other components? - JL
  background: -moz-linear-gradient(right, #e5ffee, #e5ffee);
  background: -o-linear-gradient(right, #e5ffee, #e5ffee);
  background: linear-gradient(to left, #e5ffee, #e5ffee);*/
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
