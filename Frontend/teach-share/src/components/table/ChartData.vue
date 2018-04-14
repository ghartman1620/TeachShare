<template>
<div>
     <section class="container">
        <div class="columns">
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
        </div>

    </section>
                <!-- <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
            <a class="nav-link active" data-toggle="tab" href="#home" role="tab">Bar Graph</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#profile" role="tab">Line Graph</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#messages" role="tab">Pie Chart</a>
        </li>
    </ul>

    <div class="tab-content">
        <div class="tab-pane active" id="home" role="tabpanel">                
            <LineGraph userLabel=userLabel v-bind:userData=userData></LineGraph>
        </div>
        <div class="tab-pane" id="profile" role="tabpanel">
            <BarGraph userLabel=userLabel v-bind:userData=userData></BarGraph>
        </div>
        <div class="tab-pane" id="messages" role="tabpanel">
            <a><PieChart userLabel=userLabel v-bind:userData=userData></PieChart></a>
        </div>
    </div> -->

</div>
</template>

<script>
    import Vue from "vue";
    import BarGraph from './BarGraph'
    import LineGraph from './LineGraph'
    import PieChart from './PieChart'
    
    export default Vue.component( "chart", {
        props: {
            userLabel: {
                type: String,
                required: true
            },
            userData: {
                type: Object,
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
        components: {
            BarGraph,
            LineGraph,
            PieChart
        },
        mounted(){
            console.log("ChartData mounted!");

        }
    });
</script>