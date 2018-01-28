<template>
  <ul>
    <li v-for="item in items" :key="item.pk">{{ item }}</li>
  </ul>
</template>

<script>
import Vue from 'vue';

export default Vue.component('list-component', {
    props: ['items'],
    data() {
      return {

      }
    }
  })
</script>
