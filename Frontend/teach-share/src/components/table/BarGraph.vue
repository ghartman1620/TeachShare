<script>
var datacollection = {};

//Importing Bar class from the vue-chartjs wrapper
import {Bar} from 'vue-chartjs'
//Exporting this so it can be used in other components
export default {
    extends: Bar,
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
    mounted () {
        //renderChart function renders the chart with the datacollection and options object.
        datacollection.labels = Object.keys(this.userData[0]);
        datacollection.datasets = [];
        var backgroundColors = ['#f87979','grey','orange','yellow','green','black','#33ff99','purple','#990000','#ff9999','#00ff80','#007399'];
        var colorCount = backgroundColors.length - 1;

        for (var i = 0; i < this.userData.length; i++) {
            var randomIndex = Math.floor(Math.random()*colorCount);
            datacollection.datasets.push(
                    {
                        label: "",
                        backgroundColor: backgroundColors[randomIndex],
                        pointBackgroundColor: 'white',
                        borderWidth: 1,
                        pointBorderColor: '#249EBF',
                        //Data to be represented on y-axis
                        data: Object.values(this.userData[i])
                    }

            );
            backgroundColors.splice(randomIndex,1);
            console.log("Random index, color number and bgcolor array: ", randomIndex, colorCount, backgroundColors);
            colorCount--;
        };

        this.renderChart(this.datacollection, this.options);
        console.log("ChartRender mounted");
        console.log("user label:  ", this.userLabel);
        console.log("userData:  ", this.userData);
        console.log("bar graph labels: ", Object.keys(this.userData));
        console.log("bar graph data: ", Object.values(this.userData));


    }
}
</script>
