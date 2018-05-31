<template>
    <body>
        <chart v-bind:userData=this.element.values></chart>
    </body>
</template>

<script>
import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import ChartData from "./ChartData";
Vue.use(BootstrapVue);

export default Vue.component("table-element", {
    data () {
        return {
            values: []
        }
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
})
</script>
