<template>
    <body>
        <b-table striped hover :items="element.content"> </b-table>
        <chart v-bind:userData=this.element.content userLabel='money'></chart>

    </body>
</template>

<script>
import Vue from "vue";
import BootstrapVue from "bootstrap-vue";
import ChartData from "./ChartData";
Vue.use(BootstrapVue);

export default Vue.component("table-element", {
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
    mounted () {
        var con = this.element.content;
        console.log("element content:", con);
        console.log("size of element content: ", con.length)
        console.log("element content[0]: ", con[0]);
    }
})
</script>
