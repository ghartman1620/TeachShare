<template>
    <div class="container body-fluid">
        <notify></notify>
        <nav-bar :query="queryParam"></nav-bar>
        <!--  -->
        <transition name="fade">
            <router-view/>
        </transition>
    </div>
</template>

<script>
import Vue from "vue";
import Navbar from "./Navbar";
import Notify from "./Notify";
import api from "../api";

export default Vue.component("base-page", {
    components: { Notify, Navbar },
    props: ["items"],
    data() {
        return {
            queryParam: ""
        };
    },
    mounted() {
        
    }
});
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

body {
    zoom: 90%;
}



</style>
