<template>
<div>
    <br>
    <div class="card" :style="{width: cardWidth + 'px', padding: '10px'}">
        <video
            ref="videoTag"
            class="align-items-center"
            :id="id"
            :src="url"
            autostart="autoplay"
            :width="width"
            :height="height"
            :controls="controls"
        >
        </video>
        
        <div class="card-body">
            <h4 class="card-title">{{ title }}</h4>
            <p :class="textClasses">
                <slot>
                    There was no content provided.
                </slot>
            </p>
        </div>
    </div>
    </div>
</template>

<script>
import Vue from "vue";

export default Vue.component("file-video", {
    props: [
        "id",
        "title",
        "width",
        "height",
        "controls",
        "source",
        "filetype",
        "autoplay"
    ],
    data() {
        return {
            video: null,
            textClasses: [
                "card-text",
                "sizing-and-gradient"
            ],
            textShown: false,
        };
    },
    computed: {
        cardWidth: function() {
            return parseInt(this.width) + 20;
        },
        url: function() {
            if (this.source.indexOf('http') === -1) {
                 return `http://localhost:8000${this.source}`;
            }
            return `${this.source}`;
        }
    },
    mounted: function() {
        this.video = this.$refs.videoTag;
    },
    methods: {
        // basic play functionality (not needed currently)
        play() {
            this.video.play();
        },
        pause() {
            this.video.pause();
        }
    }
});
</script>

<style lang="scss" scoped>

</style>
