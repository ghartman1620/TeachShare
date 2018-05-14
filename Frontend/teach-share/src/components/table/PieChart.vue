<script>
    var datacollection = {};
    //Importing Line class from the vue-chartjs wrapper
    import Vue from 'vue'
    import {Pie} from 'vue-chartjs'
    import BootstrapVue from 'bootstrap-vue'
    Vue.use(BootstrapVue);
    //Exporting this so it can be used in other components
    export default {
            extends: Pie,
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
                    //Chart options that control the appearance of the chart
                    options: {
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
            //renderChart function renders the chart with the datacollection and options object.
                function shuffleArray(array) {
                    for (var i = array.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var temp = array[i];
                        array[i] = array[j];
                        array[j] = temp;
                    }
                };

                datacollection.labels = Object.keys(this.userData[0]);
                datacollection.datasets = [];
                var backgroundColors = ['#f87979','grey','#ffa500','black','#008040','purple','#990000','#00ff80','#007399'];
                shuffleArray(backgroundColors);

                //iterate over however many datasets we have to populate graph data

                for (var i = 0; i < this.userData.length; i++) {
                    datacollection.datasets.push(
                        {
                            label: this.dataLabels[i],
                            backgroundColor: backgroundColors,
                            hoverBorderColor: 'white',
                            borderWidth: 1,
                            //pointBorderColor: '#249EBF',
                            //Data to be represented on y-axis
                            data: Object.values(this.userData[i])
                        }
                    );
                };


                this.renderChart(this.datacollection, this.options);
                // console.log("bar graph labels: ", Object.keys(this.userData));
                // console.log("bar graph data: ", Object.values(this.userData));


            }
    }
</script>
