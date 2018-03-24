<template>

    <b-container>
        <b-row align-h="center">
            <b-col cols="8">
                <b-card :title="title" :style="{width: cardWidth + 'px', padding: '10px'}">
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
                    <!-- {{title}} -->

                    <p :class="textClasses">
                        <slot>
                            There was no content provided.
                        </slot>
                    </p>

                </b-card>
            </b-col>
        </b-row>
    </b-container>
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
