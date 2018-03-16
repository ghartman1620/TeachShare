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
import router from "@/router";
import store from "@/store";
import Image from "./image/Image";

export default Vue.component("base-page", {
    components: { Notify, Navbar },
    props: ["items"],
    data() {
        return {
            queryParam: ""
        };
    },
    mounted() {
        let uid = this.$cookie.get("userId");
        if (uid !== undefined) {
            this.$store.dispatch("fetchCurrentUser", uid)
                .then((resp) => {
                    this.$logSuccess(resp);
                    this.$store.dispatch("addUser", resp)
                })
        }
        

    },
    beforeCreate() {
        const Constructor = Vue.extend(Image);
        const vm = new Constructor( { propsData: 
                {src: "http://localhost:8000/media/uploads/2018/03/15/2c3ef4c0-75e9-48ca-a00e-da83cb33de7b/wallhaven-616483.jpg"}
            }).$mount()
        console.log(vm);
        var that = this;
        // or just height / width
        console.log("Height: ", vm.$el.children[0].naturalHeight, "Width:", vm.$el.children[0].naturalWidth);
        Vue.nextTick().then(function(){
            // or just height / width
            console.log("Height: ", vm.$el.children[0].naturalHeight, "Width:", vm.$el.children[0].naturalWidth);
            console.log("Height: ", vm.$el.children[0].height, "Width:", vm.$el.children[0].width);
        }).then(function() {
            console.log("Height: ", vm.$el.children["0"].naturalHeight, "Width:", vm.$el.children["0"].naturalWidth);
            console.log("Height: ", vm.$el.children[0].height, "Width:", vm.$el.children[0].width);
        })
        setTimeout(function() {
            console.log("Height: ", vm.$el.children["0"].naturalHeight, "Width:", vm.$el.children["0"].naturalWidth);
            console.log("Height: ", vm.$el.children[0].height, "Width:", vm.$el.children[0].width);
        }, 5);
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
