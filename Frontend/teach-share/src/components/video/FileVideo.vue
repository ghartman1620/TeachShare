<template>
<div>
    <div class="card" :style="{width: cardWidth + 'px', padding: '10px'}">
        <video
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

            <!-- <div class="row">
                <div class="col-auto mr-auto"/>
                <div class="col-auto">
                    <button type="button" class="btn btn-warning">Edit</button>
                </div>
            </div> -->
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
            return `http://localhost:8000${this.source}`;
        }
    },
    mounted: function() {
        this.video = document.getElementById(this.id);
    },
    methods: {
        // basic play functionality (not needed)
        Play() {
            console.log("play");
            this.video.play();
        },
        Pause() {
            console.log("pause");
            this.video.pause();
        },
        showOrHideAllText() {
            if (!this.textShown) {
                this.textClasses.pop();
            } else {
                this.textClasses.push("sizing-and-gradient")
            }
            this.textShown = !this.textShown;
        }
    }
});
</script>

<style lang="scss" scoped>
.sizing-and-gradient {
    max-height: 200px;
    overflow:hidden;
    background: linear-gradient(#333, #eee);
    -webkit-background-clip: text;
    color: transparent;
}
</style>
