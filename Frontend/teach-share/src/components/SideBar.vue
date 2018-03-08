<template>
<div :class="sidebarClasses">
    
    <b-button @click="toggleSidebarCollapse()" class="btn-secondary sidebar-btn">
        <div v-if="collapsed">
            <font-awesome-icon icon="arrow-right"/>
        </div>
        <div v-else>
            <font-awesome-icon icon="arrow-left"/>
        </div>
    </b-button>
    <slot v-if="!collapsed">
    
    </slot>
</div>
</template>

<script>
import Vue from "vue";
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";


export default Vue.component("side-bar", {
    components: { FontAwesomeIcon },
    data() {
        return {
            sidebarClasses: ["sidebar"],
            collapsed: false,
        }
    },
    methods: {
        toggleSidebarCollapse() {
            if(this.collapsed){
                this.sidebarClasses.pop();
                this.collapsed = false;
            }
            else{
                this.sidebarClasses.push("collapsed");
                this.collapsed = true;
            }
        },
    },
});
</script>

<style lang="scss" scoped>
.sidebar {
    background-color:  #f1f1f1; //this is some random offwhite color that i picked
    // border: 3px solid black; //this is awful lets not use it to indicate end of sidebar 
    opacity: .9; //this is also an option
    position: fixed;
    height: auto; //enable me for having the white background conform to the height of the contents of the sidebar
    top: 60px; /* height of top navbar */
    left: 0;
    width: 410px;
    -webkit-transition: all 0.1s ease-in-out;
    -moz-transition: all 0.1s ease-in-out;
    transition: all 0.1s ease-in-out;
    overflow: scroll;
}
.sidebar.collapsed {
    width: 40px;
    background-color: transparent;
}
.sidebar-btn {
    width: 100%;
}
</style>
