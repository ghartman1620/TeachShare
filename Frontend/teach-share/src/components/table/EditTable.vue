<template>
    <div>
        <b-card>
            <h1>Create Data Table</h1>
                <form v-on:submit.prevent="addColumn" class="form-inline my-2 my-lg-0">
                    <span style="font-size: 1.5rem; padding-right: 1rem;">Add column:  </span>
                    <input class="form-control mr-sm-1" type="text" v-model=columnToAdd aria-label="+">
                    <button class="btn btn-dark my-2 my-sm-0" type="submit"><strong>+</strong></button>
                </form>
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

var renderfu = function (colname, entry) {
    return '<div class="btn-group" role="group" >'+
        '  <button type="button" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>'+
        '  <button type="button" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>'+
        '</div><span>'+JSON.stringify(entry)+'</span>';
};

var handleRow = function (event, entry) {
    console.log("CLICK ROW: " + JSON.stringify(entry));
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
            columns: [],
            values: [],

                inputValue: '',
                currentRow: 0,
                currentSlot: 0,
                editing: false,
                rowNum: 0,
                colNum: 0,
                colLabels: "",
                cellIn: [],
                table: [],
                header: [],
                fields: [
                    'rowHeader',
                    'sex',
                    'age'
                ],
                items: [
                    {rowHeader:'John', sex: 'Male', age: 32}, //items need keys
                    {rowHeader:'Sally', sex: 'Female', age: 33}
                ]
            }
        },
        methods: {
            test(event) {
                console.log("Test value entered: ", event.target.value);
                console.log(event);
                // console.log("Value and index: ", value, index)
                this.editing=false;
                return "Hey it worked!";
            },
            toggle() {
                this.editing=true;
            },
            submit: function(event) {
                if (
                    this.$route.query.index ==
                    this.$store.state.create.postElements.length
                ) {
                    this.$store.dispatch("addElement", {type: "table", content: this.values});
                } else {
                    this.$store.dispatch("editElement", {
                        index: this.$route.query.index,
                        element:{type: "table", content: this.values}
                    });
                }
                this.$router.push({ name: "create" });
            },
            close: function(event) {
                this.$router.push({ name: "create" });
            },
        addItem: function () {
            var self = this;
            var item = {
                // "id": this.values.length + 1,
                // "name": "name " + (this.values.length + 1)
            };
            for(var r = 0; r < this.columns.length; r++){
                let key = this.columns[r].title;
                console.log("Key to add: ", key);
                item[key] = "__";
            };
            console.log("Adding item: ", item);
            this.values.push(item);
        },
        addColumn: function () {
            if (this.columnToAdd != "") {
                var self = this
                var item = {
                    title: this.columnToAdd,
                    visible: true,
                    editable: true
                }
                for (var i = 0; i < this.values.length; i++){
                    this.values[i][this.columnToAdd] = "__";
                    console.log("Push column: ", this.columnToAdd, "onto item:  ", this.values[i]);
                }
                this.columns.push(item);
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