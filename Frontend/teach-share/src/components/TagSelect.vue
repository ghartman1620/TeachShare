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
                    <b-form-select v-model="subject" @change="loadStandards" :options="subjectOptions" class="mb-3" />
                </b-form-group>
                <b-form-group
                    label="Content type of your lesson">
                    <b-form-select v-model="contentType" :options="contentTypeOptions" class="mb-3" />
                </b-form-group>

                <b-form-group
                    v-if="subject===0 || subject===1"
                    label="Standards your lesson might fulfill"
                    description="use Ctrl+Click to select multiple">
                    <b-form-select multiple v-model="standards" :select-size="15" :options="standardOptions" class="mb-3">
                    </b-form-select>
                </b-form-group>
                <div v-else>
                    <b-form-group
                    label="Disciplinary Core Ideas"
                    description="use Ctrl+Click to select multiple">
                        <b-form-select multiple v-model="coreIdeas" :select-size="8" :options="disciplinaryCoreIdeasOptions" class="mb-3">
                        </b-form-select>
                    </b-form-group>
                    <b-form-group
                    label="Crosscutting Concepts"
                    description="use Ctrl+Click to select multiple">
                        <b-form-select multiple v-model="concepts" :select-size="8" :options="crosscuttingConceptsOptions" class="mb-3">
                        </b-form-select>
                    </b-form-group>
                    <b-form-group
                    label="Practices"
                    description="use Ctrl+Click to select multiple">
                        <b-form-select multiple v-model="practices" :select-size="8" :options="practicesOptions" class="mb-3">
                        </b-form-select>
                    </b-form-group>
                    
                    

                </div>

                <b-button variant="primary" @click="submitTagChanges">Save Tag Changes</b-button>
            </b-form>
        </b-card>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import api from "../api";
import {gradeOptions, subjectOptions, contentTypeOptions, 
        sciencePracticesOptions, scienceDisciplinaryCoreIdeasOptions, scienceCrosscuttingConceptsOptions} from "../superTagOptions";

@Component({
    name: "tag-select"
})
export default class TagSelect extends Vue {

    @Prop({default: undefined})
    post: any;

    gradeOptions: any = gradeOptions;
    subjectOptions: any = subjectOptions;
    contentTypeOptions: any = contentTypeOptions;
    disciplinaryCoreIdeasOptions: any = scienceDisciplinaryCoreIdeasOptions;
    practicesOptions: any = sciencePracticesOptions;
    crosscuttingConceptsOptions: any = scienceCrosscuttingConceptsOptions;

    
    standardOptions: any = [        
    ]
    length: number = 0;
    contentType: number = 0;
    subject: number = 0;
    grade: number = 0;
    standards: number[] = [];
    coreIdeas: number[] = [];
    concepts: number[] = [];
    practices: number[] = [];


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
        this.$parent.$emit("submitTagChanges", this.grade, this.length, this.subject, this.contentType, this.standards,
                            this.concepts, this.practices, this.coreIdeas);
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