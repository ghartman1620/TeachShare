<template>
    <div>
        <div class=" col-12 container" :key="index" v-for="(element,index) in storeElements">
            <div class="post-element-container">
                <div class="card-column column">
                    <div class="col-12 container">
                        <div class="post-element card">
                            <post-element :element="element" :index="index"></post-element>
                        </div>
                    </div>

                    <div class="justify-content-start">
                        <div id="mx-auto col-9 arrange-btn-group" class="btn-group-horizontal">

                            <button class="btn btn-dark" id="up-button" style="z-index: 2;" @click="moveElementUp(index)"><img width=20 height=20 src="/static/caret-square-up.png"></button>
                            <button class="btn btn-dark" id="down-button" style="z-index: 2;" @click="moveElementDown(index)"><img width=20 height=20 src="/static/caret-square-down.png"></button>
                            <button class="btn btn-danger" id="garbage-button" @click="removeElement(index)"><img height=20 src="/static/trash-icon.png"></button>
                            <button class="btn btn-primary" id="edit-button" @click="openEditor(index)"><img height=20 src="/static/edit-icon.png"></button>

                        </div>
                    </div>
                </div>
            </div>
            <br>
        </div>
    </div>
</template>
<script lang="ts">

import Vue from "vue";
import {Component} from "vue-property-decorator";
import PostElement from "./PostElement";
import PostComp from "./Post";

@Component({
    name: "mock-diff",
    components: {PostComp, PostElement}
})
export default class MockDiff extends Vue {
    post1: any = [
        {
            type: "text",
            content: "<p>through designing and building skateboards, we combine hands-on art and wood shop activities with STEM and business/econ lessons to create turly interdisciplinary coursework. Some activities include:</p><ul><li>skateboard company business proposal</li><li>atmospheric pressure and vacuum investigation</li></ul>"
        },
        {
            type: "file"
        }
    ]



};
</script>
<style>

</style>