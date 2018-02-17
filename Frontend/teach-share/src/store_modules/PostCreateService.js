import api from '../api';
import Vue from 'vue';

const PostCreateService = {
    state:{
        postComponents: [],
    },
    mutations:{
        emptyState() {
            this.state.postComponents = [];    
        },

        // Mutations for the currently edited post data:  and postComponents
        ADD_COMPONENT: (state, component) => {
            state.postComponents.push(component);
            console.log('add component mutation');
        },
        SWAP_COMPONENTS: (state, iAndJ) => {
            // I wrote this code because i'm triggered by being limited
            // to one function argument so I'm going to pretend I can pass two.
            var i = iAndJ[0];
            var j = iAndJ[1];
            var tmp = state.postComponents[i];
            Vue.set(state.postComponents,
                i, state.postComponents[j]);
            Vue.set(state.postComponents,
                j, tmp);
            console.log(state.postComponents);
        },
        REMOVE_COMPONENT: (state, index) => {
            state.postComponents.splice(index, 1);
        },
        EDIT_COMPONENT: (state, editedComponent) => {
            state.postComponents.splice(editedComponent.index, 1, editedComponent.component);
        }
    },
    actions:{
        // Actions for in progress posts

        addComponent: (state, component) => {
            console.log('add_component action');
            state.commit('ADD_COMPONENT', component);
        },
        // Actions are only allowed to have one argument so iAndJ is
        // a list with index 0 as the first index to be swapped
        // and index 1 the second
        swapComponents: (state, iAndJ) => {
            console.log(iAndJ[0] + ' ' + iAndJ[1]);
            state.commit('SWAP_COMPONENTS', iAndJ);
        },
        removeComponent: (state, index) => {
            state.commit('REMOVE_COMPONENT', index);
        },
        editComponent: (state, editedComponent) => {
            console.log('in editComponent action');
            state.commit('EDIT_COMPONENT', editedComponent);
        },
        
    },
};

export default PostCreateService;