import api from '../api';
import Vue from 'vue';

const PostCreateService = {
    state:{
        postComponents: [],
        doneMutations: [],
        unDoneMutations: [],
        nextStateId: 0,
        stateIdStack: [],
    },
    mutations:{
        UNDO: (state) => {
            console.log(state.doneMutations);
            state.doneMutations.pop();
            console.log(state.doneMutations);
            state.nextStateId--;
        },
        UNDO_ADD_COMPONENT: (state, index) => {
            state.unDoneMutations.push({});
            state.postComponents.splice(index, 1);
        },
        UNDO_REMOVE_COMPONENT: (state, arg) => {
            state.unDoneMutations.push({});
            state.postComponents.splice(arg.index, 0, arg.component);
        },
        UNDO_EDIT_COMPONENT: (state, arg) => {
            state.unDoneMutations.push({});
            state.postComponents.splice(arg.index, 1, arg.component);
        },
        UNDO_SWAP_COMPONENTS: (state, iAndJ) => {
            var i = iAndJ[0];
            var j = iAndJ[1];
            var tmp = state.postComponents[i];
            Vue.set(state.postComponents,
                i, state.postComponents[j]);
            Vue.set(state.postComponents,
                j, tmp);
        },
        // Mutations for the currently edited post data:  and postComponents
        ADD_COMPONENT: (state, component) => {
            state.stateIdStack.push(state.nextStateId);
            state.nextStateId++;
            state.doneMutations.push({mutation: 'UNDO_ADD_COMPONENT', arg: state.postComponents.length});
            state.postComponents.push(component);
            console.log(state.stateIdStack);
            console.log('add component mutation');
        },
        SWAP_COMPONENTS: (state, iAndJ) => {
            state.stateIdStack.push(state.nextStateId);
            state.nextStateId++;
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
            console.log(state.stateIdStack);
            console.log(state.postComponents);
        },
        REMOVE_COMPONENT: (state, index) => {
            state.stateIdStack.push(state.nextStateId);
            state.nextStateId++;
            state.doneMutations.push({mutation: 'UNDO_REMOVE_COMPONENT', arg: {component: state.postComponents[index], index: index}});
            state.postComponents.splice(index, 1);
            console.log(state.stateIdStack);
        },
        EDIT_COMPONENT: (state, editedComponent) => {
            state.stateIdStack.push(state.nextStateId);
            state.nextStateId++;
            state.doneMutations.push({mutation: 'UNDO_EDIT_COMPONENT', arg: {component: state.postComponents[editedComponent.index], index: editedComponent.index}});
            state.postComponents.splice(editedComponent.index, 1, editedComponent.component);
            console.log(state.stateIdStack);
        },

        PUSH_STATE_ID: (state, id) => {
            state.stateIdStack.push(id);
            console.log(state.stateIdStack);
        },
        POP_STATE_ID: (state, id) => {
            state.stateIdStack.pop();

        }
    },
    actions:{
        // Actions for in progress posts
        pushStateId: (context, id) => {
            context.commit('PUSH_STATE_ID', id)
        },
        popStateId: (context) => {
            context.commit('POP_STATE_ID');
        },
        undo: (context) => {
            console.log(context.state.doneMutations);
            if (context.state.doneMutations.length > 0){
                var mut = context.state.doneMutations[context.state.doneMutations.length-1];
                context.commit('UNDO');
                context.commit(mut.mutation, mut.arg);
                console.log(context.state.doneMutations);
            }
        },
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
    getters: {
        getNextStateId: state => () => state.nextStateId,
    }
};

export default PostCreateService;