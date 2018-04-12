<template>
     <section class="container">
        <h1>Demo example of vue-chart-js</h1>
        <div class="columns">
            <div class="column">
                <h3>Line Chart</h3>
                <ChartRender></ChartRender>
            </div>
        </div>
    </section>
</template>

<script>
    import Vue from "vue";
    import ChartRender from './ChartRender'

    export default Vue.component( "chart", {
        components: {
            ChartRender
        }
    });
</script>