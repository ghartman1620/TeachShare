//This component listens for an event from each grid-item, while the grid-layout's key
//re-renders the page when all elements have reported their own rendered dimensions

<template>
    <grid-layout :key="allElementsUpdated" v-if="storeElements.length > 0"
            :layout="layout"
            :col-num="2"
            :row-height="rowHeight"
            :is-draggable="true"
            :is-resizable="false"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[1,1]"
            :use-css-transforms="true"
            
    >
                <grid-item @update-height="updateHeight" :key="index" v-for="(element,index) in layout"
                    :x='layout[index]["x"]'
                    :y='layout[index]["y"]'
                    :w='layout[index]["w"]'
                    :h='layout[index]["h"]'
                    :i='layout[index]["i"]'
                    :minW="1"   
                    :minH="1"
                    :element="storeElements[index]"
                    :index="index">
                </grid-item>


    </grid-layout>
</template>

<script lang="ts">
import Vue from "vue";
import vuex from "vuex";
import { Component, Prop, Watch } from "vue-property-decorator";
import GridItem from "./drag_and_drop/GridItem.vue";
import GridLayout from "./drag_and_drop/GridLayout.vue";
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

// var GridLayout = VueGridLayout.GridLayout;
// var GridItem = VueGridLayout.GridItem;

@Component({
    name: "drag-and-drop",
    components: { GridLayout, GridItem }
})

export default class DragAndDrop extends Vue{
    allElementsUpdated : Boolean = false;
    childEventsReceived : number = 0;
    rowHeight : number = 10;
    newHeight : number = 0;
    storeElements: Object[] = getCurrentPost(this.$store)!.elements;
    layout : Object[] = [{"x":0, "y":0, "w":2, "h":15, "i":"0"}];
    removeElement(index: number, element: Object) {
        console.log("Element to be removed:  ", element);
        removeElement(this.$store, index);
    }
    updateHeight (elementDim) {
        var index : String = elementDim.index;
        var height : number = elementDim.height;
        console.log("Element dimensions in Drag and Drop caught by event listener:    ", elementDim);
        for(var x = 0; x < this.layout.length; x++) {
            let item : String = this.layout[x]["i"];
            if (item === index) {
                this.childEventsReceived = this.childEventsReceived + 1;
                console.log("Item found in updateHeight()! Here's its height at the moment",  this.layout[x]["h"]);
                if (height > this.layout[x]["h"]*this.rowHeight) {
                    this.newHeight = Math.ceil(height/this.rowHeight);
                    console.log("Not high enough! resize to ", this.newHeight);
                    this.layout[x]["h"] = this.newHeight;
                }
                console.log("Events received:  ", this.childEventsReceived);
            }
        }
        if (this.childEventsReceived === this.layout.length) {
            this.allElementsUpdated = true;}
        }

    mounted() {
        console.log("store elements here: ", this.storeElements);
        if (this.storeElements.length > 1) {
            for (var prev_index = 0; prev_index < this.storeElements.length - 1; prev_index++) {
                let index = prev_index + 1; //index of the element layout item we're pushing.
                console.log("Increment for new index ", this.layout[prev_index]["h"]/15)
                var new_position = this.layout[prev_index]["y"] + this.layout[prev_index]["h"]/15;
                this.layout.push({"x":0, "y":new_position, "w":2, "h":15, "i":index.toString()});
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