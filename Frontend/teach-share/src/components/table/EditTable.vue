<template>
    <div>
        <b-card>
            <b-form>
                <div class="modal-body row">
                    <div class="colRowLabel col-md-3">
                        <span><h5><strong>Number of rows:</strong></h5></span>
                    </div>
                    <div class="colRowInput">
                        <b-form-input v-model.number="rowNum" type="number" placeholder="Enter the number of rows for the table" @change="tableResize()">
                        </b-form-input>
                    </div>
                    <div class="colRowLabel col-md-3">
                        <span><h5><strong>Number of columns: </strong></h5></span>
                    </div>

                    <div class="colRowInput">
                        <b-form-input v-model.number="colNum" type="number" placeholder="Enter the number of columns for the table" @change="tableResize()">
                        </b-form-input>
                    </div>
                </div>
                    <div>
                    <b-form-input v-model="colLabels" type="text" placeholder="Enter the names of the column labels" @change="tableCreate()">
                    </b-form-input>
                    </div>
                <b-container>
                    <b-row v-for="rows in rowNum">
                        <b-col v-for="cols in colNum "> 
                            <b-form-input class="tableEntry" v-model="cellIn[rows - 1] [cols - 1]" type="text" placeholder="Enter a data value or label" @change="tableCreate()">
                            </b-form-input>
                        </b-col>
                    </b-row>
                </b-container>
            </b-form>

            <b-table striped hover :items="table">
            </b-table>

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
    import Vue from "vue";


    export default Vue.component("edit-table", {
        data() {
            return {
                rowNum: 0,
                colNum: 0,
                colLabels: "",
                cellIn: [],
                table: [],
                header: [],
                showBarGraph: false,
                showLineGraph: false,
                showPieChart: false
            }
        },

        methods: {
            tableResize(){
                this.cellIn = new Array(this.rowNum);
                console.log(this.cellIn);
                for(var i = 0; i < this.rowNum; i++){
                    this.cellIn[i] = new Array(this.colNum);
                    console.log(this.cellIn);
                }
                this.tableCreate();
            },

            tableCreate(){
                this.header = new Array(this.colNum);
                this.header = this.colLabels.split(",");
                console.log("column labels split: ", this.header);
                this.table = new Array(this.rowNum);
                for(var r = 0; r < this.rowNum; r++){
                    var obj = {};
                    for(var c = 0; c < this.colNum; c++){
                        obj[this.header[c]] = this.cellIn [r][c];
                    }
                    this.table[r] = obj;
                }
            },

            submit: function(event) {
                if (
                    this.$route.query.index ==
                    this.$store.state.create.postElements.length
                ) {
                    this.$store.dispatch("addElement", {type: "table", content: this.table});
                } else {
                    this.$store.dispatch("editElement", {
                        index: this.$route.query.index,
                        element:{type: "table", content: this.table}
                    });
                }
                this.$router.push({ name: "create" });
            },
            close: function(event) {
                this.$router.push({ name: "create" });
            }
        }
    });
</script>

<style lang="scss" scoped>
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