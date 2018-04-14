<template>
    <b-table striped hover :items="element.content"> </b-table>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

@Component({
    name: "table-element"
})
export default class TableElement extends Vue{
    @Prop({})
    element!: any;
}
</script>