<template>
<div ref="content" :class="contentClasses">
    <div :style="hideOrFullStyle">
        <div>
            <div>
                <slot></slot>
            </div>
        </div>
    </div>
    <div>
        <button v-if="needShowMore" @click="showOrHideContent" class="btn btn-dark btn-block">{{ expandedOrNotText }}</button>
    </div>
</div>
</template>

<script>
import Vue from "vue";

export default Vue.component("see-more", {
    props: ["maxHeight"],
    data: function() {
        return {
            expanded: false,
            elementHeight: 0,
            contentClasses: [],
            needShowMore: true,
        };
    },
    computed: {
        expandedOrNotText() {
            return this.expanded ? "See Less" : "See More"
        },
        hideOrFullStyle() {
            return this.expanded ? {
                "max-height": "none",
                "overflow": "hidden"
            } : {
                "max-height": this.maxHeight+"px",
                "overflow": "hidden"
            }
        },
    },
    methods: {
        showOrHideContent() {
            if (!this.expanded) {
                this.contentClasses.pop();
            } else {
                this.contentClasses.push("gradient");
            }
            this.expanded = !this.expanded;
        }
    },
    mounted() {
        var vm = this;
        Vue.nextTick().then(function() {
            var ele = vm.$refs.content;
            vm.elementHeight = ele.offsetHeight;
            console.log("nextTick: ", vm.elementHeight)
            if(vm.elementHeight > vm.maxHeight){
                vm.contentClasses.push('gradient');
                vm.needShowMore = true;
                vm.expanded = false;
            } else {
                vm.needShowMore = false;
            }
        });
    }
});
</script>
<style>

.gradient {
    position: relative;
    /* that disables clicking through carousels/DL files on hidden things */
}
.gradient:after {
    content  : "";
    position : absolute;
    z-index  : 1;
    bottom   : 38px;
    left     : 2%;
    pointer-events   : none;
    background-image : linear-gradient(to bottom, 
                        rgba(255,255,255, 0), 
                        rgba(255,255,255, 1) 80%);
    width    : 96%;
    height   : 6em;
}

</style>




