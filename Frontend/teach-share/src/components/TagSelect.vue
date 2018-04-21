<template>
    <div>
        <b-card >
            <b-form>
                <b-form-group label="Grade level of lesson">
                    <b-form-select v-model="grade" @change="loadStandards" :options="gradeOptions" class="mb-3" />
                </b-form-group>
                <b-form-group 
                    label="Length of the lesson"
                    description="Approximately how long, in minutes, will your lesson take?">
                    <b-form-input v-model="length"
                        type="number"/>
                </b-form-group>
                <b-form-group
                    label="Subject area of your lesson">
                    <b-form-select v-model="subject" :options="subjectOptions" class="mb-3" />
                </b-form-group>
                <b-form-group
                    label="Content type of your lesson">
                    <b-form-select v-model="contentType" :options="contentTypeOptions" class="mb-3" />
                </b-form-group>
                <b-form-group
                    label="Standards your lesson might fulfill"
                    description="use Ctrl+Click to select multiple">
                    <!-- {{standardOptions}} -->
                    <b-form-select multiple v-model="standards" :select-size="15" :options="standardOptions" class="mb-3">
                        <!-- <option v-for="std in standardOptions" :value="std.value">{{std.text}}</option> -->
                    </b-form-select>
                </b-form-group>

                <b-button variant="primary" @click="submitTagChanges">Save Tag Changes</b-button>
            </b-form>
        </b-card>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import api from "../api";

@Component({
    name: "tag-select"
})
export default class TagSelect extends Vue {

    @Prop({default: undefined})
    post: any;

    gradeOptions: any = [
        { value: 0, text: "Preschool"},
        { value: 1, text: "Kintergarden"},
        { value: 2, text: "First Grade"},
        { value: 3, text: "Second Grade"},
        { value: 4, text: "Third Grade"},
        { value: 5, text: "Fourth Grade"},
        { value: 6, text: "Fifth Grade"},
        { value: 7, text: "Sixth Grade"},
        { value: 8, text: "Seventh Grade"},
        { value: 9, text: "Eighth Grade"},
        { value: 10, text: "9-12th Grade"},
           
    ];
    subjectOptions: any = [
        {value: 0, text: 'Math'},
        {value: 1, text: 'English Language Arts'},
        {value: 2, text: 'Physical Sciences'},
        {value: 3, text: 'Life Sciences'},
        {value: 4, text: 'Earth and Space Sciences'},
        {value: 5, text: 'Engineering, Technology, and the Applications of Science'},
        {value: 6, text: 'Other (elaborate in tags!)'},
    ]
    contentTypeOptions: any = [
        {value: 0, text: 'Game'},
        {value: 1, text: 'Lab'},
        {value: 2, text: 'Lecture'},
    ]
    standardOptions: any = [        
    ]
    length: number = 0;
    contentType: number = 0;
    subject: number = 0;
    grade: number = 0;
    standards: number[] = [];
    //it seems like the v-model tag doesn't set this.grade until after the request
    //has been sent - so we'll give it a few moments to notice we've made a change
    //before we send the request to update standards.
    loadStandards() {
        window.setTimeout(this.loadStandardsHelp,5);
        
    }
    loadStandardsHelp(){
        this.standardOptions = [];   
        var vm: TagSelect = this;
        console.log("in loadstandards" + this.grade);
        console.log(this.standardOptions);
        api.get(`/standards/?grade=${this.grade}&subject=${this.subject}`).then(function(response: any) {
            console.log(response.data);
            console.log(vm.standardOptions);
            for(var std of <any[]>response.data){
                vm.standardOptions.push({
                    value: std.pk,
                    text: std.name + " (" + std.code +")",
                })
            }
            console.log(vm.standardOptions);
            console.log(vm.grade);
        })
        console.log(this.grade);
    }
    submitTagChanges(){
        this.$parent.$emit("submitTagChanges", this.grade, this.length, this.subject, this.contentType, this.standards);
    }
    mounted() {
        if(this.post !== undefined){
            this.grade = this.post.grade;
            this.contentType = this.post.contentType;
            this.subject = this.post.subject;
            this.length = this.post.length;
            this.standards = this.post.standards;
            this.loadStandards();
        }
        else{
            this.grade = 0;
            this.contentType = 0;
            this.subject = 0;
            this.length = 0;
        }
    }
};

</script>

<style>

</style>