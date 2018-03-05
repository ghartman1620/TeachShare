<template>
    <div>
        <div v-if="!editing">
            <text-element
                :element="comment">
            </text-element>
        </div>
        <div v-if="editing">
            <edit-text
                :element="comment">
            </edit-text>
        </div>
    </div>
</template>

<script>
import TextElement from "../text/TextElement";
import EditText from "../text/EditText";

export default {
    name: "comment-entry",
    props: ["comment"],
    components: {TextElement, EditText},
    data: function() {
        return {
            editing: false,
        }
    },
    methods: {

    }
}
</script>

<style lang="scss" scoped>

</style>
