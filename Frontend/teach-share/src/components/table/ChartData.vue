<template>
    <div>
         <section class="container">
            <!-- <div class="columns">

                <div class="column">
                    <h3>Bar Graph</h3>
                    <BarGraph userLabel=userLabel v-bind:userData=userData></BarGraph>
                </div>
                <div class="column">
                    <h3>Line Chart</h3>
                    <LineGraph userLabel=userLabel v-bind:userData=userData></LineGraph>
                </div>
                <div class="column">
                    <h3>Pie Chart</h3>
                    <PieChart userLabel=userLabel v-bind:userData=userData></PieChart>
                </div>
            </div> -->

             <b-tabs>
                 <b-tab title="Bar Graph" @click="setActiveTab('bar')" active>
                     <br>
                     <BarGraph v-if="activeTab==='bar'" userLabel=userLabel v-bind:userData=userData></BarGraph>
                 </b-tab>
                 <b-tab title="Line Graph" @click="setActiveTab('line')">
                     <br>
                     <LineGraph v-if="activeTab==='line'" userLabel=userLabel v-bind:userData=userData></LineGraph>
                 </b-tab>
                 <b-tab title="Pie Chart" @click="setActiveTab('pie')">
                     <br>
                     <PieChart v-if="activeTab==='pie'" userLabel=userLabel v-bind:userData=userData></PieChart>
                 </b-tab>
             </b-tabs>

        </section>


    </div>
</template>

<script>
    import Vue from 'vue'
    import BarGraph from './BarGraph'
    import LineGraph from './LineGraph'
    import PieChart from './PieChart'
    import BootstrapVue from 'bootstrap-vue'
    Vue.use(BootstrapVue);

    export default Vue.component( "chart", {
        props: {
            userLabel: {
                type: String,
                required: true
            },
            userData: {
                type: Array,
                required: true
            },
        },
        // data() {
        //     return {
        //         userLabel: "",
        //         userData: [],
        //         userLabelList: []
        //     };

        // },
        data () {
            return {
                activeTab: 'bar'
            }
        },
        methods: {
            setActiveTab (graph) {
                this.activeTab = graph;
            }
        },
        components: {
            BarGraph,
            LineGraph,
            PieChart,
            BootstrapVue
        },
        mounted(){
            console.log("ChartData mounted!");

        }
    });
</script>
