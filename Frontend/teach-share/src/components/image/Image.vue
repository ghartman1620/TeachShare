<template>
    <div>
        <img :src="src" alt="">
    </div>
</template>

<script>
import Vue from "vue";

export default Vue.component("image-element", {
    // functional: true,
    props: ["src"],
    data() {
        return {
           
        };
    },
    computed: {},
    methods: {
        
    },
    mounted() {
        
    }
});
</script>
