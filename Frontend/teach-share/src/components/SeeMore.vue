<template>
<body>
    <div ref="content" :style="getContentStyle()" class="sizing-and-gradient">
        <slot>
            

        </slot>
    </div>
    <div v-if="!expanded" :style="getGradientStyle()"></div>
    <div v-if="maxHeight < elementHeight">
        <button v-if="!expanded" @click="expanded = true;" ref="button" class="btn btn-dark btn-block">See More</button>
        <button v-if="expanded" @click="expanded = false;" ref="button" class="btn btn-dark btn-block">See Less</button>
    </div>
</body>
</template>

<script>
import Vue from "vue";

export default Vue.component("see-more", {
  props: ["maxHeight"],
  data: function() {
    return {
      expanded: false,
      elementHeight: 0,
      gradient: {}
    };
  },
  methods: {
    getContentId() {
      console.log("in content id");
      console.log(this.index);
      return "content" + this.index;
    },
    getGradientStyle() {
      if (this.elementHeight > this.maxHeight) {
        return this.gradient;
      } else {
        return {};
      }
    },
    getContentStyle() {
      if (this.expanded || this.elementHeight <= this.maxHeight) {
        return {};
      } else {
        return this.contentStyleHidden;
      }
    }
  },
  mounted() {
    var ele = this.$refs.content;
    this.elementHeight = ele.offsetHeight;
    console.log(this.elementHeight);
    this.contentStyleHidden = {
      overflow: "hidden",
      "max-height": this.maxHeight.toString() + "px"
    };
    // const GRADIENT_BOTTOM = "37px";
    // this.gradient = {
    //   position: "absolute",
    //   overflow: "hidden",
    //   zIndex: "2",
    //   right: "0px",
    //   bottom: GRADIENT_BOTTOM,
    //   left: "0px",
    //   height: "300px",
    //   background:
    //     "linear-gradient(to bottom,  rgba(255,255,255,0) 70%,rgba(52,58,64, .9) 100%)"
    // };
  }
});
</script>




