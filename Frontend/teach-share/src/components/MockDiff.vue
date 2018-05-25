<template>
    <div class="diff">
        <div class="row">
            <h3 class="col-4">
                Your post
            </h3>
            <h3 class="col-8">
                Suggested Changes
            </h3>
        </div>
        <div class="row">
            
            <div class="col-4 elem">
                <div class="container" v-for="(element,index) in this.post1">
                    <div class="post-element-container stupid-class">
                        <div class="card-column column">
                            <div class="col-12 container">
                                <div class="post-element card">
                                    <post-element :element="element" :index="index"></post-element>
                                </div>
                            </div>

                            
                        </div>
                    </div>
                    <br>
                </div>
            </div>
            
            <font-awesome-icon style="z-index: 3; position: absolute; left: 100; top: 100;" icon="plus"></font-awesome-icon>
            <img style="z-index:3; position: absolute; left: 150; top: 100;"    height=17 width=17 src="/static/edit-icon.png">
            <div class="col-7 elem">
                <div class="container" v-for="(element,index) in this.post2">
                    
                    
                                        
                    <div class="post-element-container stupid-class">
                        <div class="card-column column">
                            <div v-if="index==0">
                                <p style="text-align: center;">
                                    Updated
                                </p>
                            </div>
                            <div v-if="index===1">
                                <p style="text-align: center;">
                                    New
                                </p>
                            </div>
                            <div class="col-12 container">
                                <div class="post-element card">
                                    <post-element :element="element" :index="index"></post-element>
                                </div>
                            </div>

                            
                        </div>
                    </div>
                    <br>
                </div>
            </div>
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
        /*{
            type: "file",
            content: [
                {
                    name: "",
                    url:
                }
            ]
        }*/
    ]

    post2: any = [
        {
            type: "text",
            content: "<p>the skateboard design class combines hands-on graphic design and material engineering activities with STEM and business/econ lessons to provide students with a truly interdisciplinary course.Some activities include:</p><ul><li>skateboard company business proposal</li><li>atmospheric pressure and vacuum investigation</li></ul>"
        },
        {
            type: "image_file",
            title: "",
            body: "students learn how to utilize a thin air press to leverage the Earth's atmospheric pressure to form the veneer against the foam mold",
            content: [{
                url: "https://files.slack.com/files-pri/T8T5V90DP-FAX3EV2S3/img_20170518_122707.jpg",
                description: "Students learn how to utilize a thin air press to leverage the Earth's atmospheric pressure to form the veneer against the foam mold"
            }]
        }
    ]


};
</script>
<style lang="scss">

$background-color: #e5ffee;
$title-tag-card-background: darken(#bececa, 5%);
$dark-green: #3b896a;
$card-shadow: 4px 8px 8px -1px rgba(0, 0, 0, 0.4);
$card-color: #96e6b3;

.stupid-class {
    background-color: $card-color;
}
.elem {
    width: 40%;
}

.post-element-container {
    padding-top: 30px;
    padding-right: 20px;
    padding-left: 20px;
    padding-bottom: 10px;
    border-radius: 5px;
    box-shadow: $card-shadow;
    background-color: $card-color;
}

.tag-entry {
    font-size: 12pt;
    margin: 8px;
}

.tag-entry:hover {
    background-color: darken(gray, 10%);
    cursor: pointer;
}

.round-button {
    max-width: 100px;
    max-height: 100px;
    padding-bottom: 11%;
    border-radius: 50%;
    border: 0 solid #f5f5f5;
    overflow: hidden;
    background: $title-tag-card-background;
    box-shadow: 1 1 4px gray;
}

#button-bar {
    min-width: 665px;
    max-height: 240px;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 1px;
    padding-right: 1px;
    border-radius: 60px;
    background: $title-tag-card-background;
    justify-content: center;
    box-shadow: $card-shadow;
}

#text-icon {
    margin-right: 0.2rem;
}

#audio-icon {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
}
#video-icon {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
}
#image-icon {
    margin-left: 0.2rem;
    margin-right: 0.2rem;
}
#file-icon {
    margin-left: 0.2rem;
}
#text-icon:hover {
    background: #bf8301;
}
#video-icon:hover {
    background: #ad5c00;
}
#audio-icon:hover {
    background: #3b685b;
}
#image-icon:hover {
    background: #13213f;
}
#file-icon:hover {
    background: #1a3c68;
}

#title-tag-card {
    background-color: $title-tag-card-background;
    margin-top: 2rem;
    border: none;
    box-shadow: $card-shadow;
}

#tag-submit-box {
    margin-bottom: 10px;
}

#tag-delete-button {
    margin-bottom: 5px;
}

#up-button {
    margin-top: 10px;
    margin-left: 1rem;
    background-color: $dark-green;
}

#up-button:hover {
    background-color: darken($dark-green, 10%);
}

#down-button {
    margin-top: 10px;
    margin-left: 6px;
    background-color: $dark-green;
}

#down-button:hover {
    background-color: darken($dark-green, 10%);
}

#garbage-button {
    margin-left: 10px;
    margin-top: 10px;
    // margin-right: 1rem;
    float: right;
}

#edit-button {
    margin-top: 10px;
    float: right;
}

.round-button img {
    display: block;
    width: 100%;
    padding: 0%;
    height: auto;
}

.foreground {
    position: fixed;
    left: 20%;
    top: 20%;
    width: 80%;
    margin: auto;
    z-index: 2;
    opacity: 1;
}

.postheader {
    height: 30px;
    width: 100%;
}

/* Submitted elements now being viewed */
.container-element {
    width: 60%;
    height: 300px;
}

.icon-card-container {
    background-color: #e5ffee;
    border: 0;
}

.card {
    background-color: #e5ffee;
    position: relative;
}

.title {
    font-size: 1.5rem;
}

.title-placeholder {
    opacity: 0.5;
}

.undo-button {
    margin-right: 1rem;
}

.redo-button {
    margin-right: 1rem;
}

.tag-card {
    background-color: $title-tag-card-background;
    border: 0;
    display: inline;
    padding: 10px;
}

.post-element,
card-row {
    background-color: $title-tag-card-background;
}

.title-container {
    width: 100%;
}

.bottom-navbar {
    height: 50px;
    background-color: lighten(
        rgba($title-tag-card-background, 0.9),
        15%
    ) !important;
    border-top: 1px solid darken($title-tag-card-background, 10%);
}
</style>