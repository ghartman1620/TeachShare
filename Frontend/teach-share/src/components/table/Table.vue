<template>
            <table class="table table-bordered table-hover table-condensed table-striped vue-table">
                <thead>
                    <tr>
                        <th v-for="(column, index) in displayCols" :key="index">
                            <!--:class="getClasses(column)"-->
                            {{ column.title }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(entry, index) in values" :key="index">
                        <td v-for="(column, index2) in displayColsVisible" :key="index2"
                            v-show="column.visible" :class="column.cellstyle">
                            <span v-if="column.renderfunction!==false" v-html="column.renderfunction( column.name, entry )"></span>
                            <span v-else-if="!column.editable"> {{ entry[column.name] }} </span>
                            <value-field-section v-else
                                :entry="entry"
                                :columnname="column.name"></value-field-section>
                        </td>
                    </tr>
                </tbody>
            </table>
 
</template>

<style>

    .vue-table {
        table-layout: fixed;
    }

    table.vue-table thead > tr > th {
        cursor: pointer;
        padding-right: 20px !important;
        min-width: 100px;
    }


    .vue-table .editableField {
        cursor:pointer;
    }

    .vue-table .selected-cell {
        background-color: #F7C072;
    }

    .vue-table .selected-row {
        background-color: #FAE1BE /*!important;*/
    }
</style>

<script>
    import Vue from "vue";
    import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
    import axios from 'axios';
    import qs from 'qs';
    import lodashorderby from 'lodash.orderby';
    import lodashincludes from 'lodash.includes';
    import lodashfindindex from 'lodash.findindex';

    /* Field Section used for displaying and editing value of cell */
    var valueFieldSection = {
        template: 
            '<span v-if="!enabled" @click="toggleInput" class="editableField">{{this.entry[this.columnname]}}</span>'+
            '<div v-else-if="enabled" class="input-group">'+
                '<input type="text" class="form-control" id="number" v-model="datavalue" @keyup.enter="saveThis" @keyup.esc="cancelThis">'+
                '   <span class="input-group-btn">'+
                '       <button class="btn btn-danger" type="button" @click="cancelThis" ><span>X</span></button>'+
                '       <button class="btn btn-primary" type="button" @click="saveThis" ><font-awesome-icon icon="check" fixed-width></font-awesome-icon></button>'+
                '   </span>'+
            '</div>',
    components: { FontAwesomeIcon},
      props: ['entry','columnname'],
      data () {
          return {
            enabled: false,
            datavalue: "",
          }
      },
      methods: {
        saveThis: function () {
            var originalValue = this.entry[this.columnname];
            this.entry[this.columnname] = this.datavalue;
            this.$parent.$emit('cellDataModifiedEvent', originalValue, this.datavalue, this.columnname,  this.entry);
            this.enabled = !this.enabled;
        },
        cancelThis: function () {
            this.datavalue = this.entry[this.columnname];
            this.enabled = !this.enabled;
        },
        toggleInput: function () {
            this.datavalue= this.entry[this.columnname];
            this.enabled=!this.enabled;
        },
      }
    };

    export default {
        name: "VueBootstrapTable",
        components: {
            'value-field-section': valueFieldSection,
            FontAwesomeIcon: FontAwesomeIcon
        },
        props: {
            /**
             * The column titles, required
             */
            columns: {
                type: Array,
                required: true,
            },
            /**
             * The rows, an Array of objects
             */
            values: {
                type: Array,
                required: false,
            },
            /**
             * Enable/disable table sorting, optional, default true
             */
            sortable: {
                type: Boolean,
                required: false,
                default: true,
            },
            /**
             * Enable/disable table multicolumn sorting, optional, default false.
             * Also sortable must be enabled for this function to work.
             */
            multiColumnSortable: {
                type: Boolean,
                required: false,
                default: false,
            },
            /**
             * Enable/disable input filter, optional, default false
             */
            showFilter: {
                type: Boolean,
                required: false,
                default: false,
            },
            /**
             * Define if Filter search field is to work in a case Sensitive way. Default: true
             */
            filterCaseSensitive: {
                type: Boolean,
                required: false,
                default: true,
            },
            /**
             * Enable/disable column picker to show/hide table columns, optional, default false
             */
            showColumnPicker: {
                type: Boolean,
                required: false,
                default: false,
            },
            /**
             * Enable/disable pagination for the table, optional, default false
             */
            paginated: {
                type: Boolean,
                required: false,
                default: false,
            },
            /**
             * If pagination is enabled defining the page size, optional, default 10
             */
            pageSize: {
                type: Number,
                required: false,
                default: 10,
            },
            /**
             * Function to handle row clicks
             */
            rowClickHandler: {
                type: Function,
                required: false,
                default: function () {}
            },
        },
        data () {
            return {
                filteredSize: 0,
                filterKey: "",
                sortKey: [],
                sortOrders: {},
                sortChanged: 1,
                columnMenuOpen: false,
                displayCols: [],
                filteredValues: [],
                page: 1,
                echo: 0,
                loading: false,
            };
        },
        mounted: function () {
          this.$nextTick(function () {
              this.loading= true;
            //   this.setSortOrders();
              var self = this;
              this.columns.forEach(function (column) {
                  var obj = self.buildColumnObject(column);
                  self.displayCols.push(obj);
              });
              this.processFilter();
          })
        },
        created: function () {
            var self = this ;
            this.$on('cellDataModifiedEvent', self.fireCellDataModifiedEvent);
        },
        beforeDestroy: function(){
            var self = this ;
            this.$off('cellDataModifiedEvent', self.fireCellDataModifiedEvent);
        },
        watch: {
            values: function () {
                this.processFilter();
            },
            columns: function () {
                this.displayCols = [];
                var self = this;
                this.columns.forEach(function (column) {
                    var obj = self.buildColumnObject(column);
                    self.displayCols.push(obj);
                });
                this.setSortOrders();
                this.processFilter();
            },
        //     showFilter: function () {
        //         this.filterKey = "";
        //     },
        //     showColumnPicker: function () {
        //         this.columnMenuOpen = false;

        //         this.displayCols.forEach(function (column) {
        //             column.visible = true;
        //         });
        //     },
            filterKey: function () {
                // filter was updated, so resetting to page 1
                this.page = 1;
                this.processFilter();
            },
            sortKey: function () {
                this.processFilter();
            },
            sortChanged: function () {
                this.processFilter();
            },
            page: function () {
                this.processFilter();
            },
            paginated: function () {
                this.processFilter();
            },
            loading: function () {
                /*document.getElementById("loadingdiv").style.width = document.getElementById("maindiv").getBoundingClientRect().width + "px";
                document.getElementById("loadingdiv").style.height = document.getElementById("maindiv").getBoundingClientRect().height+"px";*/
            }
        },
        computed: {
            displayColsVisible: function () {
                var displayColsVisible = [];
                for (var a in this.displayCols) {
                    if (this.displayCols[a].visible)
                        displayColsVisible.push(this.displayCols[a]);
                }
                return displayColsVisible;
            },
            // filteredValuesSorted: function () {
            //     var tColsDir = [];
            //     for(var i=0, len=this.sortKey.length; i < len; i++){
            //         tColsDir.push(this.sortOrders[this.sortKey[i]].toLowerCase());
            //     }
            //     return lodashorderby(this.filteredValues, this.sortKey , tColsDir);
            // },
            validPageNumbers: function () {
                // 5 page max
                var result = [];
                var start = 1;
                if (this.page > 3)
                    start = this.page-2;
                for ( var i = 0 ; start <= this.maxPage && i<5; start++ ) {
                    result.push(start);
                    i++;
                }
                return result;
            },
            maxPage: function () {
                return Math.ceil(this.filteredSize / this.pageSize);
            },
            showPaginationEtc: function () {
                var temp = 1;
                if (this.page > 3)
                    temp = this.page-2;
                return ( (temp+4) < this.maxPage  );
            },
        },
        methods: {
            fireCellDataModifiedEvent:function ( originalValue, newValue, columnTitle, entry) {
                this.$parent.$emit('cellDataModifiedEvent',originalValue, newValue, columnTitle, entry);
            },
            processFilter: function () {
            var self = this;
            var result = this.values.filter(item => {
                var good = false;
                for (var col in self.displayColsVisible) {
                    if (self.filterCaseSensitive) {
                        if (lodashincludes(item[self.displayColsVisible[col].name] + "", self.filterKey + "")) {
                            good = true;
                        }
                    } else {
                        if (lodashincludes((item[self.displayColsVisible[col].name] + "").toLowerCase(), (self.filterKey + "").toLowerCase())) {
                            good = true;
                        }
                    }

                }
                return good;
            });

            var tColsDir = [];
            for(var i=0, len=this.sortKey.length; i < len; i++){
                tColsDir.push(this.sortOrders[this.sortKey[i]].toLowerCase());
            }
            result = lodashorderby(result, this.sortKey, tColsDir);
            this.filteredSize = result.length;
            if (this.paginated) {
                var startIndex = (this.page - 1) * this.pageSize;
                var tIndex = 0;
                var tempResult = [];
                while (tIndex < this.pageSize) {
                    if (typeof result[startIndex + tIndex] !== "undefined")
                        tempResult.push(result[startIndex + tIndex]);
                    tIndex++;
                }
                self.filteredValues = tempResult;
            } else
                self.filteredValues = result;
                self.loading = false;
            
            },
            buildColumnObject: function (column) {
                var obj = {};
                obj.title = column.title;
                if ( typeof column.name !== "undefined")
                    obj.name = column.name;
                else
                    obj.name = column.title;
                if ( typeof column.visible !== "undefined")
                    obj.visible = column.visible;
                else
                    obj.visible = true;
                if ( typeof column.editable !== "undefined")
                    obj.editable = column.editable;
                else
                    obj.editable = false;
                if ( typeof column.renderfunction !== "undefined")
                    obj.renderfunction = column.renderfunction;
                else
                    obj.renderfunction = false;
                if ( typeof column.columnstyle !== "undefined")
                    obj.columnstyle = column.columnstyle;
                else
                    obj.columnstyle = "";
                if ( typeof column.cellstyle !== "undefined")
                    obj.cellstyle = column.cellstyle;
                else
                    obj.cellstyle = "";

                return obj;
            },
            setSortOrders: function () {
                this.sortKey = [];
                var sortOrders = {};
                this.columns.forEach(function (column) {
                    sortOrders[column.name] = "";
                });
                this.sortOrders = sortOrders;

            },
            toggleColumn: function (column) {
                column.visible = !column.visible;
            },
            closeDropdown: function () {
                this.columnMenuOpen = false;
            },
        },
    }
</script>
