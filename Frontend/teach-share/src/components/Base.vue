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

<script lang="ts">
import Vue from "vue";
import NavBar from "./Navbar.vue";
import Notify from "./Notify.vue";
import { addUser, setUser, fetchUser } from "../store_modules/UserService";
// import Image from "./image/Image";
import IDBStore from "../indexedDBStore";

import Component from 'vue-class-component'

@Component({
    components: { Notify, NavBar}
})
export default class Base extends Vue {
    queryParam: string = "";

    get computedMsg() {
        return `computed ${this.queryParam}`;
    }
    // waitDelay(delayLength: Number|undefined, vm): void {
    //     var that = this;

    //     // is the value undefined/not provided? Just in case, not actually
    //     // particularly possible considering it's the first of two
    //     // required arguments
    //     if (delayLength === undefined) {
    //         delayLength = 0;
    //     }

    //     // is it already mounted and ready?
    //     if (vm._isMounted && vm.$el.children[0].height !== 0 && vm.$el.children[0].width !== 0) {
    //         console.error({height: vm.$el.children[0].height, width: vm.$el.children[0].width});
    //     } else {

    //         // wait 'delayLength' and then print or call recursively adding 10ms each time 
    //         // until complete..
    //         setTimeout(function() {
    //             if (vm._isMounted && vm.$el.children[0].height !== 0 && vm.$el.children[0].width !== 0) {
    //                 console.error({height: vm.$el.children[0].height, width: vm.$el.children[0].width});
    //             } else {
    //                 that.waitDelay(Number(delayLength)+1, vm);
    //             }
    //         }, delayLength);
    //     }
    // }

    mounted() {
        let idbs = new IDBStore("default", 1);
        // console.log("[IDBSTORE]: ", idbs);

        if (document.cookie !== "") {
            let uid = document.cookie.match(new RegExp("(?:pk=(?<pk>[^;]+))"));
            if (typeof uid !== "undefined") {
                let id = uid as RegExpMatchArray;
                let actualid = id["groups"]["pk"];
                let vm = this;
                fetchUser(this.$store, actualid).then((resp) => {
                    addUser(vm.$store, resp);
                    setUser(vm.$store, resp);
                });
            }
        }
        // this.$notifySuccess("please work....");
        // this is an example of how to check an images height/width without actually mounting it on the page
        // const Constructor = Vue.extend(Image);
        // const vm = new Constructor( { propsData: 
        //         {src: "http://localhost:8000/media/uploads/2018/03/15/2c3ef4c0-75e9-48ca-a00e-da83cb33de7b/wallhaven-616483.jpg"}
        //     }).$mount()
        // console.log(vm);
        // console.log("Height: ", vm.$el.children[0].height, "Width:", vm.$el.children[0].width);
        // this.waitDelay(0, vm);

        // you can do this (has worked on my many tests) or a generic timeout just to ensure the data is propogated.
        // you can't attach the listener directly to the img tag because it's not actually in the dom.

        // @TODO: make a function that does a very short delay, checks the values and slowly backs off -- or 
        // any other method that doesn't require an arbitrary wait. Cause this current method actually 
        // could potentially not work.
        // window.addEventListener('load', () => {
        //     console.log("Height: ", vm.$el.children["0"].naturalHeight, "Width:", vm.$el.children["0"].naturalWidth);
        // });
    }
}
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
    z-index: 1;
    zoom: 90%;
}



</style>
