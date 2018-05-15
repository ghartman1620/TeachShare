<template>
    <grid-layout v-if="this.storeElements.length > 0"
            :layout="layout"
            :col-num="2"
            :row-height="30"
            :is-draggable="true"
            :is-resizable="false"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            :use-css-transforms="true"
            
    >

            <grid-item :key="index" v-for="(element,index) in layout"
                :x="layout[index]['x']"
                :y="layout[index]['y']"
                :w="layout[index]['w']"
                :h="layout[index]['h']"
                :i="index"
                :minW="1"
                :minH="4"
                :element="storeElements[index]"
                :index="index">
            </grid-item>

    </grid-layout>
</template>

<script lang="ts">
import Vue from "vue";
import vuex from "vuex";
import { Component, Prop, Watch } from "vue-property-decorator";
import VueGridLayout from "vue-grid-layout";
import GridItem from "./drag_and_drop/GridItem.vue";
import PostElement from "./PostElement.vue";

import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";
import { mapState } from "vuex";

import { addElement, 
    editElement, 
    setGrade,
    beginPost, 
    getCurrentPost, 
    createPost, 
    undo, 
    redo, 
    setTags, 
    swapElements, 
    removeElement,
    setSubject, 
    setContentType, 
    setLength,
    saveDraft 
} from "../store_modules/PostCreateService";

var GridLayout = VueGridLayout.GridLayout;
// var GridItem = VueGridLayout.GridItem;

@Component({
    name: "drag-and-drop",
    components: { GridLayout, GridItem }
})

export default class DragAndDrop extends Vue{
    storeElements: Object[] = getCurrentPost(this.$store)!.elements;
    layout : Object[] = [{"x":0, "y":0, "w":2, "h":5, "i":0}];
    removeElement(index: number, element: Object) {
        console.log("Element to be removed:  ", element);
        removeElement(this.$store, index);
    }
    mounted() {
        //doesn't get remounted upon addition of element....
        console.log("store elements here: ", this.storeElements);
        if (this.storeElements.length > 1) {
            for (var prev_index = 0; prev_index < this.storeElements.length - 1; prev_index++) {
                let index = prev_index + 1; //index of the element layout item we're pushing.
                let new_position = this.layout[prev_index]["y"] + this.layout[prev_index]["h"];
                this.layout.push({"x":0, "y":new_position, "w":2, "h":5, "i":index.toString()});
            }
        }
        console.log("DragAndDrop.vue updated layout: ", this.layout)
    }
};  

</script>

<style>
#gridItem {
    background-color: lightblue;
}
</style>