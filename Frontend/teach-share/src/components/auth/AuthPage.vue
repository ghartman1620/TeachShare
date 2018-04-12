<template>
<div>
    <notify/>
    <div class="auth-page">
        <b-form @submit.prevent="submit">
            <slot>

            </slot>
            
            <b-button 
                class="submitButton"
                variant="primary"
                type="submit">
                {{submitFunctionName}}
            </b-button>
        </b-form>
        
        <router-link 
            v-if="this.redirectName!=undefined && this.redirectText != undefined" 
            :to="{name: this.redirectName}">
            {{redirectText}}
        </router-link>
    </div>
</div>

</template>

<script lang="ts">
import Vue from "vue";
import Notify from "../Notify.vue";

import { Component, Prop } from "vue-property-decorator";
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from "vuex-class";

@Component({
    name: "auth-page",
    components: {Notify,}
})
export default class AuthPage extends Vue{
    @Prop ({})
    submitFunctionName!: string;

    

    @Prop({})
    redirectText!: string;

    @Prop({})
    redirectName!: string;

    

    submit() {
        this.$log("IN SUBMIT");
        this.$emit("submitAuth");
    }
};
</script>

<style lang="scss" scoped>
.auth-page {
    width: 360px;
    padding: 4% 0 0;
    margin: auto;
    top: 100px;
    position: relative;
    z-index: 2;
    background: #F1F1F1;
    max-width: 360px;
    margin: 0 auto 100px;
    padding: 45px;
    text-align: center;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);

}

.submitButton {
    width: 100%;
}


</style>
