<script>
  //Importing Line class from the vue-chartjs wrapper
  import {Line} from 'vue-chartjs'
  //Exporting this so it can be used in other components
  export default {
      extends: Line, 
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
        datacollection: {
        //Data to be represented on x-axis
          labels: ["hey","you"], 
          datasets: [
            {
              label: this.userLabel,
              backgroundColor: '#f87979',
              pointBackgroundColor: 'white',
              borderWidth: 1,
              pointBorderColor: '#249EBF',
              //Data to be represented on y-axis
              data: [1,2]
            }
          ]
        },
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
      this.renderChart(this.datacollection, this.options)
      console.log("LineGraph userData: ", Object.values(this.userData))
    }
  }
</script>