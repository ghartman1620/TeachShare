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
            <b-table striped hover :items="this.displayData"> </b-table>
            <b-tabs>
                 <b-tab v-if="this.graphOptions.bar === true" title="Bar Graph" @click="setActiveTab('bar')" active>
                     <br>
                     <BarGraph v-if="activeTab==='bar'" userLabel=userLabel v-bind:userData=userData v-bind:dataLabels=displayLabels></BarGraph>
                 </b-tab>
                 <b-tab v-if="this.graphOptions.line === true" title="Line Graph" @click="setActiveTab('line')">
                     <br>
                     <LineGraph v-if="activeTab==='line'" userLabel=userLabel v-bind:userData=userData v-bind:dataLabels=displayLabels></LineGraph>
                 </b-tab>
                 <b-tab v-if="this.graphOptions.pie === true" title="Pie Chart" @click="setActiveTab('pie')">
                     <br>
                     <PieChart v-if="activeTab==='pie'" userLabel=userLabel v-bind:userData=userData v-bind:dataLabels=displayLabels></PieChart>
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
                activeTab: 'bar',   
                displayData: {},
                displayLabels: []        
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
        mounted () {
            console.log("ChartData mounted!");
            this.displayData = JSON.parse(JSON.stringify(this.userData));
            this.graphOptions = this.userData.pop();
            console.log("Enabled graphs object: ", this.graphOptions);
            if (this.graphOptions.rowLabel !== false) {
                console.log("Have to delete row labels. Here is the userData object: ", this.userData);
                for (var i = 0; i < this.userData.length; i++) {
                    this.displayLabels.push(this.userData[i][this.graphOptions.rowLabel]);
                    delete this.userData[i][this.graphOptions.rowLabel];
                }
                console.log("Display labels:  ", this.displayLabels);
            }
            console.log("User data array to be sent to graphs", this.userData);


        }
    });
</script>
