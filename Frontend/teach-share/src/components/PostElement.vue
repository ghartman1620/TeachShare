<!--
This element views a single post element. Used in PostCreate and PostFeed.
Uses TextElement, VideoElement, etc.
-->

<template>
    <div>
        <div class="post-element card" v-if="element.type === 'text'">
            <text-element :element="element"></text-element>

        </div>
        <div class="post-element card" v-else-if="element.type === 'image_file'">
            <image-element 
                :title="element.title" 
                :body="element.description" 
                :images="element.content"
                :width="element.width"
                :height="element.height"
            />
        </div>
        <div class="post-element card" v-else-if="element.type === 'audio'">
            <audio-element :id="element.content[0].id"
            :title="element.content[0].title"
            :body="element.content[0].description"
            :controls="true" :source="element.content[0].url"
            :filetype="element.content[0].filetype"
            autoplay="false"/>
        </div>

        <div class="post-element card" id="outer-video-container" v-else-if="element.type === 'video_link' || element.type === 'video_file'">
            <div class="post-element video-post" id="inner-video-container" v-if="element.type === 'video_link'">
                    <video-element
                        name="vid-comp1"
                        :id="element.content.id"
                        :height="element.content.height"
                        :width="element.content.width"
                        :title="element.content.title"
                        :source="element.content.url"
                        controls="true"
                        autoplay="false"
                        isEmbed=true>
                    <div slot="description">{{element.content.description}}</div>
                    </video-element>
                </div>
                <div v-else>
                    <video-element
                        name="vid-comp2"
                        :id="element.content.id"
                        :height="element.content.height"
                        :width="element.content.width"
                        :title="element.content.title"
                        :source="element.content.url"
                        controls="true"
                        autoplay="false"
                        isFile=true>
                    <div slot="description">{{element.content.description}}</div>
                    </video-element>
            </div>
        </div>
        <div class="post-element card" v-else-if="element.type === 'file'">
            <file-element :element="element"/>
        </div>
    </div>
</template>

<script>
import Vue from "vue";
import SeeMore from "./SeeMore"

import TextElement from "./text/TextElement";

import AudioElement from "./audio/AudioElement";
import VideoElement from "./video/VideoElement";
import FileElement from "./file/FileElement";
import ImageElement from "./image/ImageElement";


export default Vue.component("post-element", {
    props: ["element", "index"],
    components: {SeeMore, TextElement, VideoElement, FileElement, ImageElement},
});
</script>

<style lang="scss" scoped>

#inner-video-container {
    margin-top: 2rem;
    margin-left: 2rem;
    margin-right: 2rem;
}

.post-element {
    border: 0;
}

.video-post {
    border: 0;
}

.body {
    background-color: white;
    border: 3px solid blue;
}
</style>
