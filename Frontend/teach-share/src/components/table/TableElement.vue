<template>
    <body>
        <chart v-bind:userData=this.element.content></chart>
    </body>
</template>

<script>
import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import ChartData from "./ChartData";
Vue.use(BootstrapVue);

export default Vue.component("table-element", {
    data () {
        values: []
    },
    props: {
        element: {
            type: Object,
            required: true
        }
    },
    components: {
        ChartData,
        BootstrapVue
    },
    mounted: function () {
        console.log("content sent to table element: ", this.element);
    }
})
</script>
