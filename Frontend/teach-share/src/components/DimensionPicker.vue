<template>
    <div class="row">
        <div class="col-6">
            <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-height">Height</span>
            </div>
            <input
                @change="changeHeight"
                v-validate="'required|between:100,1024'"
                v-model.number="height"
                type="number"
                class="form-control"
                name="height"
                aria-describedby="basic-height">
            </div>
        </div>
        <div class="col-6">
            <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-width">Width</span>
            </div>
            <input
                @change="changeWidth"
                v-validate="'required|between:100,1024'"
                v-model.number="width"
                type="number"
                class="form-control"
                name="width"
                aria-describedby="basic-width">
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';

export default Vue.component('dimension-picker', {
  components: {},
  props: [],
  data() {
    return {
      width: Number(640),
      height: Number(480)
    };
  },
  computed: {
    
  },
  methods: {
      changeWidth() {
          console.log(this.width);
          this.$parent.$emit('changeWidth', Number(this.width));
      },
      changeHeight() {
          console.log(this.height)
          this.$parent.$emit('changeHeight', Number(this.height));
      }
  }
});
</script>

<style lang="scss" scoped>

</style>
