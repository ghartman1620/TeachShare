<template>
    <div>
        <div v-for="element in this.post1" class="post-element-container">
            <div class="card-column column">

                <div class="col-11 container">
                    <div class="post-element card">
                        <post-element :element="element"></post-element>
                    </div>
                </div>


            </div>

        </div>
    </div>
</template>
<script lang="ts">

import Vue from "vue";
import {Component} from "vue-property-decorator";
import PostElement from "./PostElement";
import PostComp from "./Post";

@Component({
    name: "mock-diff",
    components: {PostComp, PostElement}
})
export default class MockDiff extends Vue {
    post1: any = [
        {
            type: "text",
            content: "<p>through designing and building skateboards, we combine hands-on art and wood shop activities with STEM and business/econ lessons to create turly interdisciplinary coursework. Some activities include:</p><ul><li>skateboard company business proposal</li><li>atmospheric pressure and vacuum investigation</li></ul>"
        },
        {
            type: "file"
        }
    ]



};
</script>
<style>

</style>