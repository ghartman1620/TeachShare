<script>
  var datacollection = {};
  //Importing Line class from the vue-chartjs wrapper
  import {Pie} from 'vue-chartjs'
  //Exporting this so it can be used in other components
  export default {
    extends: Pie, 
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
        // datacollection: {
        //   labels: ['January', 'February', 'March', 'April'], 
        //   datasets: [
        //     {
        //       backgroundColor: ['yellow','red','blue','cyan'],
        //       hoverBorderColor: 'white',
        //       borderWidth: 1,
        //       data: [5, 70, 9, 16]
        //     },
        //     {
        //       backgroundColor: ['yellow','red','blue','cyan'],
        //       hoverBorderColor: 'white',
        //       borderWidth: 1,
        //       data: [30, 31, 9, 30]
        //     }
        //   ]
          
        // },
        datacollection,
        //Chart.js options that controls the appearance of the chart
        options: {
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
        var backgroundColors = ['#f87979','grey','orange','yellow','green','black','#33ff99','purple','#990000','#ff9999','#00ff80','#007399'];
        shuffleArray(backgroundColors);
        // var colorCount = backgroundColors.length - 1;
        // var randomColors = [];
        // //populate random color array
        
        // console.log("user data length:", this.userData[0].length);

        // for (var i = 0; i < this.userData[0].length; i++) {
        //     var randomIndex = Math.floor(Math.random()*colorCount);
        //     randomColors.push(backgroundColors[randomIndex]);
        //     backgroundColors.splice(randomIndex,1);
        //     colorCount--;
        //console.log("Random index, color number and bgcolor array: ", randomIndex, colorCount, backgroundColors);

        // }

        for (var i = 0; i < this.userData.length; i++) {
            datacollection.datasets.push(
                    {
                        label: "",
                        backgroundColor: backgroundColors,
                        hoverBorderColor: 'white',
                        borderWidth: 1,
            //          pointBorderColor: '#249EBF',
                        //Data to be represented on y-axis
                        data: Object.values(this.userData[i])
                    }
            );
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