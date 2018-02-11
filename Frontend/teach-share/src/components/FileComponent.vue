<template>
<div class="card" style="width: 18rem;">
  <!-- <img class="card-img-top" src="" alt="Card image cap"> -->
  <div class="card-body">
    <h5 class="card-title">{{filename}}</h5>
    <p class="card-text">
      <slot>
        Alternate text
      </slot>
    </p>

  </div>
</div>
</template>

<script>
import Vue from 'vue';

export default Vue.component('file-component', {
    props: ['title', 'filename'],
    data() {
      return {

      }
    }
})
</script>
