import api from '../api';
import Vue from 'vue';

const PostCreateService = {
    state:{
        postComponents: [],
        doneMutations: [],
        unDoneMutations: [],
    },
    mutations:{
        UNDO: (state) => {
            state.doneMutations.pop();
        },
        REDO: (state) => {
            state.unDoneMutations.pop();
        },
        UNDO_ADD_COMPONENT: (state, index) => {
            state.unDoneMutations.push({mutation: 'ADD_COMPONENT', arg: state.postComponents[index]});
            state.postComponents.splice(index, 1);
            console.log(state.unDoneMutations);
        },
        UNDO_REMOVE_COMPONENT: (state, arg) => {
            state.unDoneMutations.push({mutation: 'REMOVE_COMPONENT', arg: arg.index});
            state.postComponents.splice(arg.index, 0, arg.component);
            console.log(state.unDoneMutations);

        },
        UNDO_EDIT_COMPONENT: (state, arg) => {
            state.unDoneMutations.push({mutation: 'EDIT_COMPONENT', arg: {index: arg.index, component: state.postComponents[arg.index]}});
            state.postComponents.splice(arg.index, 1, arg.component);
            console.log(state.unDoneMutations);

        },
        UNDO_SWAP_COMPONENTS: (state, iAndJ) => {
            state.unDoneMutations.push({mutation: 'SWAP_COMPONENTS', arg: iAndJ})
            var i = iAndJ[0];
            var j = iAndJ[1];
            var tmp = state.postComponents[i];
            Vue.set(state.postComponents,
                i, state.postComponents[j]);
            Vue.set(state.postComponents,
                j, tmp);
            console.log(state.unDoneMutations);

        },
        // Mutations for the currently edited post data:  and postComponents
        ADD_COMPONENT: (state, component) => {

            state.doneMutations.push({mutation: 'UNDO_ADD_COMPONENT', arg: state.postComponents.length});
            state.postComponents.push(component);
            console.log('add component mutation');
        },
        SWAP_COMPONENTS: (state, iAndJ) => {

            // I wrote this code because i'm triggered by being limited
            // to one function argument so I'm going to pretend I can pass two.
            state.doneMutations.push({mutation: 'UNDO_SWAP_COMPONENTS', arg: iAndJ});
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

            state.doneMutations.push({mutation: 'UNDO_REMOVE_COMPONENT', arg: {component: state.postComponents[index], index: index}});
            state.postComponents.splice(index, 1);
        },
        EDIT_COMPONENT: (state, editedComponent) => {

            state.doneMutations.push({mutation: 'UNDO_EDIT_COMPONENT', arg: {component: state.postComponents[editedComponent.index], index: editedComponent.index}});
            state.postComponents.splice(editedComponent.index, 1, editedComponent.component);
        },
        CLEAR_REDO: (state) => {
            state.unDoneMutations = [];
        }

    },
    actions:{
        // Actions for in progress posts

        undo: (context) => {
            console.log(context.state.doneMutations);
            if (context.state.doneMutations.length > 0){
                var mut = context.state.doneMutations[context.state.doneMutations.length-1];
                context.commit('UNDO');
                context.commit(mut.mutation, mut.arg);
                console.log(context.state.doneMutations);
            }
        },
        redo: (context) => {
            if (context.state.unDoneMutations.length > 0){
                var mut = context.state.unDoneMutations[context.state.unDoneMutations.length-1];
                console.log(mut);
                context.commit('REDO');
                context.commit(mut.mutation, mut.arg);
            }
        },
        addComponent: (state, component) => {
            console.log('add_component action');
            state.commit('ADD_COMPONENT', component);
            state.commit('CLEAR_REDO');
        },
        // Actions are only allowed to have one argument so iAndJ is
        // a list with index 0 as the first index to be swapped
        // and index 1 the second
        swapComponents: (state, iAndJ) => {
            console.log(iAndJ[0] + ' ' + iAndJ[1]);
            state.commit('SWAP_COMPONENTS', iAndJ);
            state.commit('CLEAR_REDO')
        },
        removeComponent: (state, index) => {
            state.commit('REMOVE_COMPONENT', index);
            state.commit('CLEAR_REDO')
        },
        editComponent: (state, editedComponent) => {
            console.log('in editComponent action');
            state.commit('EDIT_COMPONENT', editedComponent);
            state.commit('CLEAR_REDO')
        },
        
    },

};

export default PostCreateService;