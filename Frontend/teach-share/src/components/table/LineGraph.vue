<script>
    var datacollection = {};
    //Importing Line class from the vue-chartjs wrapper

    import {Line} from 'vue-chartjs'
    import BootstrapVue from 'bootstrap-vue'
    import Vue from 'vue'
    Vue.use(BootstrapVue);
    //Exporting this so it can be used in other components
    export default {
        extends: Line,
        props: {
            userData: {
                type: Array,
                required: true
            },
            dataLabels: {
                    type: Array,
                    required: true
            }
        },

        data () {
            return {
                datacollection,
                //Chart.js options that controls the appearance of the chart
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                            beginAtZero: true
                            },
                            gridLines: {
                            display: true
                            }
                        }],
                        xAxes: [ {
                            gridLines: {
                            display: false
                            }
                        }]
                    },
                    legend: {
                        display: true
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        components: {
            BootstrapVue
        },
        mounted () {
            datacollection.labels = Object.keys(this.userData[0]);
            datacollection.datasets = [];
            
            var backgroundColors = ['#f87979','grey','#ffaf31','black','#008040','purple','#990000','#00ff80','#007399'];
            var colorCount = backgroundColors.length - 1;
            //iterate over however many datasets
            for (var i = 0; i < this.userData.length; i++) {
                var randomIndex = Math.floor(Math.random()*colorCount);
                datacollection.datasets.push(
                        {
                            label: this.dataLabels[i],
                            backgroundColor: backgroundColors[randomIndex],
                            fill: false,
                            pointBackgroundColor: backgroundColors[randomIndex],
                            borderWidth: 5,
                            borderColor: backgroundColors[randomIndex],
                            pointBorderColor: backgroundColors[randomIndex],
                            //Data to be represented on y-axis
                            data: Object.values(this.userData[i])
                        }
                );
                backgroundColors.splice(randomIndex,1);
                console.log("Random index, color number and bgcolor array: ", randomIndex, colorCount, backgroundColors);
                colorCount--;
            };

            if (this.dataLabels.length === 0) {
                this.options.legend.display = false;
            }


            //renderChart function renders the chart with the datacollection and options object.
            this.renderChart(datacollection, this.options);
        }
    }
</script>
