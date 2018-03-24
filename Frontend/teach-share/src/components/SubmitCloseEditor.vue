<template>
    <b-row>
        <b-col cols="6" offset="3">
            <button @click.prevent="$emit('submit');" type="submit" :disabled="disabled" class="btn btn-primary btn-block">
                <span v-if="disabled">{{disableMessage}}</span>
                <span v-else>Submit {{type}}</span>
            </button>
        </b-col>
        <b-col cols="2">
            <b-button type="button" variant="danger" @click="$emit('close');">
            Cancel
            </b-button>
        </b-col>
    </b-row>

</template>

<script>
import Vue from "vue";

export default Vue.component("submit-close-editor", {
    props: ["type", "disabled", "disableMessage"],
    methods: {
        close(){
            this.$emit('close');
        }
    }
})
</script>