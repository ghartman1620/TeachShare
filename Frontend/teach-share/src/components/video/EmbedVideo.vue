<template>
    <div class="container row">
    <div class="card" :style="{width: cardWidth + 'px', padding: '10px'}">
        <div :class="aspectRatioClass">
            <iframe
                class="embed-responsive-item"
                :id="id"
                :width="width"
                :height="height"
                :src="actualSource">
            </iframe>
        </div>
    <div class="card-body">
        <h4 class="card-title">{{ title }}</h4>
            <p :class="textClasses">
                <slot>
                    There was no content provided.
                </slot>
            </p>
            <!-- <button type="button" @click.prevent="showOrHideAllText" class="btn btn-dark btn-block">
                <span v-if="!textShown">read more...</span>
                <span v-else>read less</span>
            </button> -->
        </div>
    </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component({
  name: "embed-video",
  props: [
    "id",
    "autoplay",
    "width",
    "height",
    "controls",
    "title",
    "source",
    "playlist",
    "loop"
  ],
})
export default class EmbedVideo extends Vue {
  @Prop({}) id;
  @Prop({}) autoplay;
  @Prop({}) width;
  @Prop({}) height;
  @Prop({}) controls;
  @Prop({}) title;
  @Prop({}) source;
  @Prop({}) playlist;
  @Prop({}) loop;
  
  textClasses: string[] = ["card-text"];
  textShown: boolean = false;
  cardWidth() {
    return parseInt(this.width) + 20;
  }
  aspectRatioClass() {
    var ratio = this.width / this.height;
    // all the ratios are fudged down slightly to make the ratios match up more closely to
    // values that are 'in-between'.
    if (ratio >= 19 / 9) {
      return "embed-responsive embed-responsive-21by9";
    } else if (ratio >= 14 / 9) {
      return "embed-responsive embed-responsive-16by9";
    } else if (ratio >= 7 / 6) {
      return "embed-responsive embed-responsive-4by3";
    } else {
      return "embed-responsive embed-responsive-1by1";
    }
  }
  actualSource() {
    var temp = this.source;
    var url = new URL(this.source);
    var params = url.searchParams;

    let videoID = params.get("v");

    if (this.playlist) {
      params.append("playlist", this.playlist);
    }
    if (this.autoplay) {
      params.append("autoplay", "1");
    }
    if (this.loop) {
      params.append("loop", "1");
    }
    if (this.controls) {
      if (this.controls === true) {
        params.append("controls", "1");
      } else {
        params.append("controls", "0");
      }
    }
    return `https://youtube.com/embed/${videoID}`;
  }
};
</script>

<style lang="scss" scoped>
.sizing-and-gradient {
  max-height: 200px;
  overflow: hidden;
  background: linear-gradient(#333, #eee);
  -webkit-background-clip: text !important;
  background-clip: text;
  color: transparent;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 4s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

