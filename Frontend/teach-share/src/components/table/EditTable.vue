<template>
    <div>
        <b-card>
            <h1>Create Data Table</h1>
            <div class="row">
                <div class="col-5">
                <form v-on:submit.prevent="addColumn"  class="form-inline my-2 my-lg-0">
                    <span style="font-size: 1.5rem; padding-right: 1rem;">Add column:  </span>
                    <input class="form-control mr-sm-1" id="columnInput" type="text" v-model=columnToAdd aria-label="+">
                    <button class="btn btn-dark my-2 my-sm-0" type="submit"><strong>+</strong></button>
                </form>
                </div>
                <div v-if="this.columns.length > 0 && this.values.length > 0" class="col-2.5">
                    <span style="font-size: 1.5rem; padding-right: 1rem;">Include graphs:  </span>
                </div>
                <div v-if="this.columns.length > 0 && this.values.length > 0" class="col-4">
                    <div class="col-8 card">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="barCheck">
                            <label class="form-check-label" for="barCheck">
                                Bar Graph
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="lineCheck">
                            <label class="form-check-label" for="lineCheck">
                                Line Graph
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="pieCheck">
                            <label class="form-check-label" for="pieCheck">
                                Pie Chart
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <br>
            <button v-if="this.columns.length > 0" @click="addItem" class="btn btn-primary">+ row entry</button> <br>

            <VueBootstrapTable :columns=columns :values=values></VueBootstrapTable>
            <div class="row">
                <div class="offset-3 col-6">
                    <button @click="submit" class="btn btn-primary btn-block">
                        Submit Table
                    </button>
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-danger btn-block" @click.prevent="close">
                    Cancel
                    </button>
                </div>
            </div> 
        </b-card>


    </div>
</template>

<script>

var handleRow = function (event, entry) {
};
    import Vue from "vue";
    import BootstrapVue from "bootstrap-vue";
    import VueBootstrapTable from "./Table";
    Vue.use(VueBootstrapTable);
    Vue.use(BootstrapVue);

    export default Vue.component("edit-table", {
        components: {
            VueBootstrapTable: VueBootstrapTable
        },

        data() {
            return {
                columnToAdd: "",
                columns : [],
                values: [],
                numericValues: [],
                dataLabelsIncluded: false,
                graphOptions: {},
                returnObject: {}
            }
        },
        methods: {
            chooseGraphs: function () {
                this.graphOptions["bar"] = document.getElementById("barCheck").checked;
                this.graphOptions["line"] = document.getElementById("lineCheck").checked;
                this.graphOptions["pie"] = document.getElementById("pieCheck").checked;
                this.values.push(this.graphOptions);
            },
            firstColumnLabels: function () { //tests whether data labels are alphanumeric. If they're just numbers,
                this.dataLabelsIncluded = true; //they're probably just data and not actual labels for the rows of data.
                var key = this.columns[0].title;
                for (var i = 0; i < this.values.length; i++) {
                    if(isNaN(this.values[i][key]) === false) {
                        this.dataLabelsIncluded = false;
                    }
                }

            },
            filterNumericValues: function () { //makes sure the values are just numeric values and labels are properly recognized
                this.firstColumnLabels();
                var startingColumn = 0;
                if (this.dataLabelsIncluded === true) {
                    startingColumn = 1;
                    this.graphOptions["rowLabel"] = this.columns[0].title;
                } else {
                    this.graphOptions["rowLabel"] = false;
                }
                for (var x = startingColumn; x < this.columns.length; x++) {
                    var isNumericArray = true;
                    for (var i = 0; i < this.values.length; i++) {
                        let key = this.columns[x].title;
                        if(isNaN(this.values[i][key]) === true) {
                            isNumericArray = false;
                        }
                        if (isNumericArray === false) break;
                    }
                }
            },
            submit: function(event) {
                this.filterNumericValues();
                this.chooseGraphs();
                this.$parent.$emit("submitElement", { type: 'table', values: this.values}, this.$route.query.index);
                // if (
                //     this.$route.query.index ==
                //     this.$store.state.create.postElements.length
                // ) {
                //     this.$store.dispatch("addElement", {type: "table", content: this.values});
                // } else {
                //     this.$store.dispatch("editElement", {
                //         index: this.$route.query.index,
                //         element:{type: "table", content: this.values}
                //     });
                // }
                // this.$router.push({ name: "create" });

            },
            close (event) {
                this.$router.push({ name: "create" });
            },
        addItem: function () {
            var self = this;
            var item = {};
            for(var r = 0; r < this.columns.length; r++){
                let key = this.columns[r].title;
                item[key] = "_";
            };
            this.values.push(item);
            
        },
        addColumn: function () {
            if (this.columnToAdd != "") {
                var self = this;
                var item = {
                    title: this.columnToAdd,
                    visible: true,
                    editable: true
                };
                //populate existing rows with new column value
                for (var i = 0; i < this.values.length; i++){
                    this.values[i][this.columnToAdd] = "_";
                }
                this.columns.push(item);
                // document.getElementById('columnInput').reset();
            }
        },
        toggleFilter: function () {
            this.showFilter = !this.showFilter;
        },
        togglePicker: function () {
            this.showPicker = !this.showPicker;
        },
        togglePagination: function () {
            this.paginated = !this.paginated;
        }
    }

      
    });
</script>

<style lang="scss" scoped>

    .rowLabelInput {
        width: 8rem
    }
    .tableEntryInput {
        width: 4rem
    }
    .colRowLabel {
        padding-top: 5px;
    }
    .colRowInput {
        width: 60px;
    }
    .tableEntry{
        width: 50px;
    }
</style>