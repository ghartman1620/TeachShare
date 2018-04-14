<template>
<div>
    <b-card>
        <b-form>
            <b-form-input v-model.number="rowNum" type="number" placeholder="Enter the number of rows for the table" @change="tableResize()">
            </b-form-input>

            <b-form-input v-model.number="colNum" type="number" placeholder="Enter the number of columns for the table" @change="tableResize()">
            </b-form-input>

            <div class="container tag-card card">
                <div class="row">
                    <div class="col-2">
                         <label for="colLabelbox"><h4><strong>Column Labels: </strong></h4></label>
                    </div>
                     <div class="col-8">
                        <input class="form-control" v-model="colLabel" v-on:keyup="createTag"
                                    placeholder="add a column label" id="colLabelbox">
                    </div>
                    <div class="col-2">
                        <button @click="addColLabelBtn" id="create-label-button" class="btn btn-block btn-primary">
                            <span>
                                <font-awesome-icon icon="plus"></font-awesome-icon>
                            </span>
                         </button>
                    </div>
                </div>
                <hr>
                <span id="tag-container" :key="index" v-for="(tag,index) in postState.post.tags">
                    <span @click="removeLabel(index)" class="tag-entry badge badge-dark">{{tag}} <span aria-hidden="true">&times;</span>
                        <!-- <button id="tag-delete-button" type="button" class="btn btn-sm btn-dark" >{{"x"}}</button> -->
                    </span>
                </span>
            </div>
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

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({
    name: "edit-table",
})

export default class EditTable extends Vue{
    editing: boolean = true;
    rowNum: number = 0;
    colNum: number = 0;
    colLabels: string = "";
    cellIn: string[][] = [];
    table: string[][] = [];
    header: string[][] = [];


    startEdit(){
        this.editing = true;
    }

    stopEdit(){
        this.editing = false;
    }

    tableResize(){
        this.cellIn = new Array(this.rowNum);
        console.log(this.cellIn);
        for(var i = 0; i < this.rowNum; i++){
            this.cellIn[i] = new Array(this.colNum);
            console.log(this.cellIn);
        }
        this.tableCreate();
    }

    tableCreate(){
        this.header = new Array(this.colNum);
        for(var title = 0; title < this.colNum; title++){
            var fields = [];
            for(var part = 0; part < 2; part++){
                if(part == 0){
                    fields["key"] = title.toString();
                }
                else {
                    fields["label"] = "";
                }
            }
            this.header[title] = fields;
        }
        this.table = new Array(this.rowNum);
        for(var r = 0; r < this.rowNum; r++){
            var obj = [];
            for(var c = 0; c < this.colNum; c++){
                obj[this.header[c].key] = this.cellIn [r][c];
            }
            this.table[r] = obj;
        }
    }
    
    submit(event: any) {
        this.$parent.$emit("submitElement", {type: "table", content: this.table}, this.$route.query.index);
    }
    close(event: any) {
        this.$router.push({ name: "create" });
    }
};
</script>

<style lang="scss" scoped>
    .tableEntry{
        width: 50px;
    }
</style>

