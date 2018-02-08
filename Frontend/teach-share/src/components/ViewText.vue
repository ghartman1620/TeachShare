<template>
<body>
<p> I'm a text view component! </p>
{{component}}
<p v-html="component.contents"></p>
</body>

</template>

<script>
import Vue from "vue";

export default Vue.component("view-text", {
  props: ['component'],
  })
</script>
