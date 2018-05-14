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
            
            <div id="gridItem" :key="index" v-for="(element,index) in layout">
                <grid-item
                :x=0
                :y=0
                :w=2
                :h=5
                :i=index
                :minW="1"
                :minH="4"
                :element="element"
                :index="index">
                    <div class="col-12 container">
                        <div class="post-element-container">
                            <div class="card-column column">
                                <div class="col-12 container">
                                    <div class="post-element card"> <a>index</a>
                                        <post-element :element="element" :index="index"></post-element>
                                    </div>
                                </div>

                                <div class="justify-content-start">
                                    <div id="mx-auto col-9 arrange-btn-group" class="btn-group-horizontal">

                                        <!-- <button class="btn btn-dark" id="up-button" style="z-index: 2;" @click="moveElementUp(index)"><img width=20 height=20 src="/static/caret-square-up.png"></button>
                                        <button class="btn btn-dark" id="down-button" style="z-index: 2;" @click="moveElementDown(index)"><img width=20 height=20 src="/static/caret-square-down.png"></button>-->
                                        <!-- <button class="btn btn-danger" id="garbage-button" @click="removeElement(index)"><img height=20 src="/static/trash-icon.png"></button> -->
                                        <!--<button class="btn btn-primary" id="edit-button" @click="openEditor(index)"><img height=20 src="/static/edit-icon.png"></button> -->

                                    </div>
                                </div>
                            </div>
                        </div>
                        <br>
                    </div>
                </grid-item>
            </div>


    </grid-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
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
    elements: Object[] = [];
    layout : Object[] = [{"x":0, "y":0, "w":2, "h":5, "i":0}];
    mounted() {
        var storeElements = getCurrentPost(this.$store)!.elements;
        console.log("store elements here: ", storeElements);
        if (storeElements.length > 0) {
            this.elements.push(storeElements[0]);
        }
        if (storeElements.length > 1) {
            for (var prev_index = 0; prev_index < storeElements.length; prev_index++) {
                let index = prev_index + 1; //index of the element layout item we're pushing.
                let new_position = this.layout[prev_index]["y"] + this.layout[prev_index]["h"];
                this.layout.push({"x":0, "y":new_position, "w":2, "h":5, "i":index});
            }
        }
    }

};  

</script>

<style>
#gridItem {
    background-color: lightblue;
}
</style>