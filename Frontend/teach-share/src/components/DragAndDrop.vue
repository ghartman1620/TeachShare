//This component listens for an event from each grid-item, while the grid-layout's key
//re-renders the page when all elements have reported their own rendered dimensions

<template>
    <grid-layout @layout-updated="saveLayout" v-if="storeElements.length > 0"
            :layout="layout"
            :col-num="1"
            :row-height="rowHeight"
            :is-draggable="true"
            :is-resizable="false"
            :is-mirrored="false"
            :vertical-compact="true"
            :use-css-transforms="false"
            
    >
                <grid-item @update-layout="updateLayout" :key="index" v-for="(element,index) in layout"
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
import {ILayout} from "../models";

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
    saveDraft ,
    setLayout,
    getLayout
} from "../store_modules/PostCreateService";

// var GridLayout = VueGridLayout.GridLayout;
// var GridItem = VueGridLayout.GridItem;

@Component({
    name: "drag-and-drop",
    components: { GridLayout, GridItem }
})

export default class DragAndDrop extends Vue {
    allElementsUpdated : Boolean = false;
    childEventsReceived : number = 0;
    rowHeight : number = 1;
    defaultHeight : number = 100;
    marginHeight : number = 20;
    newHeight : number = 0;
    storeElements: Object[] = getCurrentPost(this.$store)!.elements;
    layout : ILayout[] = [{"x":0, "y":0, "w":2, "h":this.defaultHeight, "i":"0"}];

    get dbLayout(): ILayout[] {
        var dbLayout = this.layout;
        console.log("This layout moved in dragandropv.vue: ", dbLayout[0]["moved"]);
        for (var x = 0; x < dbLayout.length; x++) {
            if (dbLayout[x.toString()]["moved"] !== undefined) { console.log("deleting moved field."); delete dbLayout[x.toString()]["moved"] };
        }
        return dbLayout;
    }

    removeElement(index: number, element: Object) {
        removeElement(this.$store, index);
    }


    updateDimensions ()
    {
        if (this.childEventsReceived === this.layout.length) {
            this.allElementsUpdated = true;
        } 
    }                  
        
    updateLayout (elementDim, deleteElement, editedElement) { //this is kind of a necessary hack because, for some reason,
        let index : string = elementDim.index;//this template only listens to one gridItem event. 
        if (deleteElement === true && this.layout.length > 1) {
            for(var x = 0; x < this.layout.length; x++) {
                let item : string = this.layout[x]["i"];
                if (item === index) {
                    delete this.layout[x];
                }
            }
        }
        else if (editedElement === true) {
        }
        else {
            let height : number = elementDim.height;
            for(var x = 0; x < this.layout.length; x++) {
                console.log("Object value: ", (this.layout[x]));
                let item : string = this.layout[x]["i"];
                if (item === index) {
                    this.childEventsReceived = this.childEventsReceived + 1;
                    if (height > this.layout[x]["h"]*this.rowHeight) {
                        this.newHeight = (height/this.rowHeight);
                        this.layout[x]["h"] = this.newHeight;
                        console.log("New layout in draganddrop.vue: ", this.layout);
                        var dbLayout : any = this.layout;
                        for (var i = 0; i < dbLayout.length; i++)
                        {
                            var layout = dbLayout[i];
                            console.log("layout index here: ", dbLayout[i].i);
                        }
                        setLayout(this.$store,dbLayout);
                    }
                }
            }
            this.updateDimensions();
        }
    }

    saveLayout(newLayout) {
        console.log("Save layout in drag and drop: ", newLayout);
        setLayout(this.$store, newLayout);
    }

    mounted() { //this is pretty messy, it will be refactored soon. For now though, even like this, it works. :) -JL
        console.log("drag and drop mounted.");

        var lowestItem: ILayout = this.layout[0];

        // var lowestPosition : number = 0;
        // var lowestIndex : string = "0";

        /*if (this.storeElements.length <= 1) {
            setLayout(this.$store, this.layout);
        }*/

        let storeLayout = getLayout(this.$store);
        if (storeLayout !== undefined) {
            //debugger;
            
            if (this.storeElements.length > 1) {
                this.layout = storeLayout;
            }

            if (this.storeElements.length === storeLayout.length + 1) { //element added!
                
                var newItem = this.storeElements[this.storeElements.length - 1];
                var bottomY: number = 0;
                for (var i = 0; i < this.layout.length; i++) { //find the actual lowest thing to put our new item below.
                    if (this.layout[i]["y"] > lowestItem["y"]) {
                        lowestItem = this.layout[i];
                    }
                }
                if(lowestItem.y === undefined || lowestItem.h === undefined){
                    console.error("a layout item doesn't have y or h: it is");
                    console.error(lowestItem);    
                }
                var newPosition = lowestItem.y + lowestItem.h + this.marginHeight;
                var newIndex : string = storeLayout.length.toString();
                this.layout.push({"x":0, "y":newPosition, "w":2, "h":this.defaultHeight, "i":newIndex});
                console.log("layout in draganddrop mounted hook: ");
                console.log(getCurrentPost(this.$store)!.layout);
                console.log(this.layout);
                setLayout(this.$store, this.layout);
                // for (var prev_index = 0; prev_index < this.storeElements.length - 1; prev_index++) {
                //     let index = prev_index + 1; //index of the element layout item we're pushing.
                //     // var new_position = this.layout[prev_index]["y"] + this.layout[prev_index]["h"]/this.defaultHeight;
                //     var new_position = this.layout[prev_index]["y"] + 1;
                //     this.layout.push({"x":0, "y":new_position, "w":2, "h":this.defaultHeight + 4, "i":index.toString()});
                // }


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