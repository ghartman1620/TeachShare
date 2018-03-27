<template>
    <div class="row">
        <div class="col-6">
            <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-height">Height:  
                    

                </span>
                
            </div> 
            <input
                @input.prevent="changeHeight"
                v-validate="'required|between:100,1024'"
                v-model.number="height"
                type="number"
                min="100"
                max="1024"
                :class="{'input': true, 'outline-danger': errors.has('height'), 'form-control': true }"
                name="height"
                aria-describedby="basic-height">
            
            </div>
            <input class="fullwidth" type="range" min="100" max="1024" v-model="height">

            <span v-show="errors.has('height')" class="help text-danger">{{ errors.first('height') }}</span>
        </div>
        
        <div class="col-6">
            <div class="input-group">
            <div class="input-group-prepend">
                <span class="input-group-text" id="basic-width">Width:</span>
            </div>
            <input
                @input.prevent="changeWidth"
                v-validate="'required|between:100,1024'"
                v-model.number="width"
                type="number"
                :class="{'input': true, 'outline-danger': errors.has('width'), 'form-control': true }"
                name="width"
                aria-describedby="basic-width">
            </div>
             <span v-show="errors.has('width')" class="help text-danger">{{ errors.first('width') }}</span>
             <input class="fullwidth" type="range" min="100" max="1024" v-model="width">
        </div>
       
    </div>
</template>

<script lang="ts">
import Vue from "vue";
//import { mapFields } from "vee-validate";
import { Component } from "vue-property-decorator";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

@Component({
    name: "dimension-picker"
})
export default class DimensionPicker extends Vue{

    width: number = 640;
    height: number = 480;
    errors: any = {};

    changeWidth() {
        var vm: DimensionPicker = this;
        Vue.nextTick(function() {
            vm.$parent.$emit("changeWidth", {
                value: Number(vm.width),
                errors: vm.errors
            });
        });
    }
    changeHeight() {
        var vm: DimensionPicker = this;
        Vue.nextTick().then(function() {
            vm.$parent.$emit("changeHeight", {
                value: Number(vm.height),
                errors: vm.errors
            });
        });
    }
};
</script>

<style lang="scss" scoped>
.outline-danger {
  border-color: red;
  border-width: 0.1em;
}
.fullwidth {
  width: 100%;
}
</style>
