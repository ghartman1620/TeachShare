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
        <div class="post-element card" v-else-if="element.type === 'audio_file'">
            <audio-element :element="element"/>
        </div>
        <div class="post-element card" v-else-if="element.type === 'table'">
            <table-element :element="element"/>
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

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import SeeMore from "./SeeMore.vue"
import TextElement from "./text/TextElement.vue";
import AudioElement from "./audio/AudioElement.vue";
import VideoElement from "./video/VideoElement.vue";
import FileElement from "./file/FileElement.vue";
import ImageElement from "./image/ImageElement.vue";
import TableElement from "./table/TableElement.vue";

@Component({
    name: "post-element",
    components: {SeeMore, TextElement, VideoElement, AudioElement, TableElement, FileElement, ImageElement}
})
export default class PostElement extends Vue {
    @Prop({})
    element!: any;

    @Prop({})
    index!: number;
}
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
