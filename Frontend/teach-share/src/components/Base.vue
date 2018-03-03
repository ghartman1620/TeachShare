<template>
  <div class="container-fluid body-fluid">
    <nav-bar :query="queryParam"></nav-bar>
    <router-view/>
  </div>
</template>

<script>
import Vue from "vue";
import Navbar from "./Navbar";


export default Vue.component("base-page", {
    props: ["items"],
    data() {
      return {
        queryParam: "",
      }
    },
    created() {}
  })
</script>

<style lang="scss">


.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}


// Adds some padding to the main body, so that it's not underneath the navbar
.body-fluid {
  position: relative;
  padding-top: 100px;
}


</style>
