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
      <p key="1" :class="textClasses">
        <slot>
          There was no content provided.
        </slot>
      </p>
      <button type="button" @click.prevent="showOrHideAllText" class="btn btn-dark btn-block">
        <span v-if="!textShown">Read More...</span>
        <span v-else>Collapse Text</span>
      </button>
    </div>
  </div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.component("embed-video", {
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
  data() {
    return {
      textClasses: [
        'card-text',
        'sizing-and-gradient'
      ],
      textShown: false,
    };
  },
  computed: {
    cardWidth: function() {
      return parseInt(this.width) + 20;
    },
    aspectRatioClass: function() {
      var ratio = this.width / this.height;
      console.log(ratio);
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
    },
    actualSource() {
      var temp = this.source;
      var url = new URL(this.source);
      console.log(url);
      var params = url.searchParams;

      let videoID = params.get("v");
      console.log(url.toString());

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
  },
  methods: {
    showOrHideAllText() {
      if (!this.textShown) {
        this.textClasses.pop();
      } else {
        this.textClasses.push('sizing-and-gradient')
      }
      this.textShown = !this.textShown;
    }
  }
});
</script>

<style lang="scss" scoped>

.sizing-and-gradient {
  height: 200px;
  overflow:hidden;
  background: linear-gradient(#333, #eee);
  -webkit-background-clip: text;
  color: transparent;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 4s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

</style>

