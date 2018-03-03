<template>
    <see-more :maxHeight="actualMaxHeight">
        <div :id="index" class="container-fluid card">
            <div class="row">
                <div class="col-12">
                    <br>
                    <h2 class="text-center"><strong>{{post.title}}</strong></h2>
                    <hr>
                    <div>
                        <div :key="element.pk" v-for="element in post.content">
                            <post-element :element="element" :index="index"/>
                        </div>
                    </div>
                </div> <!-- div class="col-12" -->
            </div> <!-- div class="row" -->
        </div> <!-- div :id="index"... -->
    </see-more>
</template>

<script>
import Vue from "vue";
import SeeMore from "./SeeMore";
import PostElement from "./PostElement";

export default {
    name: "Post",
    components: {SeeMore, PostElement},
    props: ["post", "index", "maxHeight"],
    data: function() {
        return {}
    },
    computed: {
        actualMaxHeight() {
            // @TODO: make this actually show the WHOLE content, not just an arbitrarily huge maxHeight
            return this.maxHeight !== undefined ? this.maxHeight : 1000000
        }
    },
    methods: {},
  
}
</script>

<style lang="scss" scoped>

</style>
