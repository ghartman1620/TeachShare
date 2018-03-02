<template>
    <see-more :maxHeight="maxHeight">
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

export default {
    name: "Post",
    components: {SeeMore},
    props: ["post", "index", "maxHeight"],
    data: function() {
        return {
           
        }
    },
    computed: {},
    methods: {
        
    },
  
}
</script>

<style lang="scss" scoped>

</style>
