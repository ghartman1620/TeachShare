<template>
    <b-table striped hover :items="element.content"> </b-table>
</template>

<script>
import Vue from "vue";

export default Vue.component("table-element", {
    props: [
        "element"
    ]
})
</script>