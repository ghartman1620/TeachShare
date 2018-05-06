<template>

</template>

<script lang="ts">
import Vue from "vue";
import {Component} from "vue-property-decorator";
import Db from "../Content";

@Component({
    "name": "db-test"
})
export default class DbTest extends Vue{
    mounted() {
        var db = Db.getDb();
    }
};

</script>
