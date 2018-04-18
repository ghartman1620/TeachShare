<template>
    <grid-layout
            :layout="layout"
            :col-num="2"
            :row-height="30"
            :is-draggable="true"
            :is-resizable="true"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            :use-css-transforms="true"
            
    >

    <grid-item id="gridItem" v-for="item in layout"
                   :x="item.x"
                   :y="item.y"
                   :w="item.w"
                   :h="item.h"
                   :i="item.i"
                   :minW="1"
                   :minH="4">
            {{item.i}}
        </grid-item>
            

    </grid-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import VueGridLayout from "vue-grid-layout";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

var GridLayout = VueGridLayout.GridLayout;
var GridItem = VueGridLayout.GridItem;

var testLayout = [
	    {"x":0,"y":0,"w":1,"h":5,"i":"0"},
	    {"x":0,"y":3,"w":1,"h":5,"i":"1"},
	    // {"x":0,"y":6,"w":2,"h":5,"i":"2"},
	    // {"x":6,"y":0,"w":2,"h":3,"i":"3"},
	    // {"x":8,"y":0,"w":2,"h":3,"i":"4"},
	    // {"x":10,"y":0,"w":2,"h":3,"i":"5"},
	    // {"x":0,"y":5,"w":2,"h":5,"i":"6"},
	    // {"x":2,"y":5,"w":2,"h":5,"i":"7"},
	    // {"x":4,"y":5,"w":2,"h":5,"i":"8"},
	    // {"x":6,"y":4,"w":2,"h":4,"i":"9"},
	    // {"x":8,"y":4,"w":2,"h":4,"i":"10"},
	    // {"x":10,"y":4,"w":2,"h":4,"i":"11"},
	    // {"x":0,"y":10,"w":2,"h":5,"i":"12"},
	    // {"x":2,"y":10,"w":2,"h":5,"i":"13"},
	    // {"x":4,"y":8,"w":2,"h":4,"i":"14"},
	    // {"x":6,"y":8,"w":2,"h":4,"i":"15"},
	    // {"x":8,"y":10,"w":2,"h":5,"i":"16"},
	    // {"x":10,"y":4,"w":2,"h":2,"i":"17"},
	    // {"x":0,"y":9,"w":2,"h":3,"i":"18"},
	    // {"x":2,"y":6,"w":2,"h":2,"i":"19"}
];
	
@Component({
    name: "dragndrop",
    components: { GridLayout, GridItem }
})


export default class DragAndDrop extends Vue {
    data() {
        return {
            layout: testLayout
        };
    }
};

</script>

<style>
#gridItem {
    background-color: blue;
}
</style>