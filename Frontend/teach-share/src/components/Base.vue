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
    methods: {
        waitDelay(delayLength, vm) {
            var that = this;

            // is the value undefined/not provided? Just in case, not actually
            // particularly possible considering it's the first of two
            // required arguments
            if (delayLength === undefined) {
                delayLength = 0;
            }

            // is it already mounted and ready?
            if (vm._isMounted && vm.$el.children[0].height !== 0 && vm.$el.children[0].width !== 0) {
                this.$log({height: vm.$el.children[0].height, width: vm.$el.children[0].width});
            } else {

                // wait 'delayLength' and then print or call recursively adding 10ms each time 
                // until complete..
                setTimeout(function() {
                    if (vm._isMounted && vm.$el.children[0].height !== 0 && vm.$el.children[0].width !== 0) {
                        that.$log({height: vm.$el.children[0].height, width: vm.$el.children[0].width});
                    } else {
                        that.waitDelay(delayLength+1, vm);
                    }
                }, delayLength);
            }
        }
    },
    mounted() {
        let uid = this.$cookie.get("userId");
        if (uid !== undefined && uid !== null) {
            this.$store.dispatch("fetchCurrentUser", uid)
                .then((resp) => {
                    this.$logSuccess(resp);
                    this.$store.dispatch("addUser", resp)
                })
        }

        // this is an example of how to check an images height/width without actually mounting it on the page
        const Constructor = Vue.extend(Image);
        const vm = new Constructor( { propsData: 
                {src: "http://localhost:8000/media/uploads/2018/03/15/2c3ef4c0-75e9-48ca-a00e-da83cb33de7b/wallhaven-616483.jpg"}
            }).$mount()
        console.log(vm);
        // console.log("Height: ", vm.$el.children[0].height, "Width:", vm.$el.children[0].width);
        
        this.waitDelay(0, vm);

        // you can do this (has worked on my many tests) or a generic timeout just to ensure the data is propogated.
        // you can't attach the listener directly to the img tag because it's not actually in the dom.

        // @TODO: make a function that does a very short delay, checks the values and slowly backs off -- or 
        // any other method that doesn't require an arbitrary wait. Cause this current method actually 
        // could potentially not work.
        // window.addEventListener('load', () => {
        //     console.log("Height: ", vm.$el.children["0"].naturalHeight, "Width:", vm.$el.children["0"].naturalWidth);
        // });
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
