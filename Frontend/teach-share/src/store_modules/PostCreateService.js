import api from "../api";
import Vue from "vue";

const PostCreateService = {
    state: {
        postElements: [],
        doneMutations: [],
        unDoneMutations: [],
    },
    mutations: {
        UNDO: state => {
            state.doneMutations.pop();
        },
        REDO: state => {
            state.unDoneMutations.pop();
        },
        UNDO_ADD_ELEMENT: (state, index) => {
            state.unDoneMutations.push({
                mutation: "ADD_ELEMENT",
                arg: state.postElements[index]
            });
            state.postElements.splice(index, 1);
            console.log(state.unDoneMutations);
        },
        UNDO_REMOVE_ELEMENT: (state, arg) => {
            state.unDoneMutations.push({
                mutation: "REMOVE_ELEMENT",
                arg: arg.index
            });
            state.postElements.splice(arg.index, 0, arg.element);
            console.log(state.unDoneMutations);
        },
        UNDO_EDIT_ELEMENT: (state, arg) => {
            state.unDoneMutations.push({
                mutation: "EDIT_ELEMENT",
                arg: { index: arg.index, element: state.postElements[arg.index] }
            });
            state.postElements.splice(arg.index, 1, arg.element);
            console.log(state.unDoneMutations);
        },
        UNDO_SWAP_ELEMENTS: (state, iAndJ) => {
            state.unDoneMutations.push({ mutation: "SWAP_ELEMENTS", arg: iAndJ });
            var i = iAndJ[0];
            var j = iAndJ[1];
            var tmp = state.postElements[i];
            Vue.set(state.postElements, i, state.postElements[j]);
            Vue.set(state.postElements, j, tmp);
            console.log(state.unDoneMutations);
        },
        // Mutations for the currently edited post data:  and postElements
        ADD_ELEMENT: (state, element) => {
            state.doneMutations.push({
                mutation: "UNDO_ADD_ELEMENT",
                arg: state.postElements.length
            });
            state.postElements.push(element);
            console.log("add element mutation");
        },
        SWAP_ELEMENTS: (state, iAndJ) => {
            // I wrote this code because i'm triggered by being limited
            // to one function argument so I'm going to pretend I can pass two.
            state.doneMutations.push({
                mutation: "UNDO_SWAP_ELEMENTS",
                arg: iAndJ
            });
            var i = iAndJ[0];
            var j = iAndJ[1];
            var tmp = state.postElements[i];
            Vue.set(state.postElements, i, state.postElements[j]);
            Vue.set(state.postElements, j, tmp);
            console.log(state.postElements);
        },
        REMOVE_ELEMENT: (state, index) => {
            state.doneMutations.push({
                mutation: "UNDO_REMOVE_ELEMENT",
                arg: { element: state.postElements[index], index: index }
            });
            state.postElements.splice(index, 1);
        },
        EDIT_ELEMENT: (state, editedElement) => {
            state.doneMutations.push({
                mutation: "UNDO_EDIT_ELEMENT",
                arg: {
                    element: state.postElements[editedElement.index],
                    index: editedElement.index
                }
            });
            state.postElements.splice(
                editedElement.index,
                1,
                editedElement.element
            );
        },
        CLEAR_REDO: state => {
            state.unDoneMutations = [];
        },

    },
    actions: {
        // Actions for in progress posts

        undo: context => {
            console.log(context.state.doneMutations);
            if (context.state.doneMutations.length > 0) {
                var mut =
                    context.state.doneMutations[context.state.doneMutations.length - 1];
                context.commit("UNDO");
                context.commit(mut.mutation, mut.arg);
                console.log(context.state.doneMutations);
            }
        },
        redo: context => {
            if (context.state.unDoneMutations.length > 0) {
                var mut =
                    context.state.unDoneMutations[context.state.unDoneMutations.length - 1];
                console.log(mut);
                context.commit("REDO");
                context.commit(mut.mutation, mut.arg);
            }
        },
        addElement: (state, element) => {
            console.log("add_element action");
            state.commit("ADD_ELEMENT", element);
            state.commit("CLEAR_REDO");
        },
        // Actions are only allowed to have one argument so iAndJ is
        // a list with index 0 as the first index to be swapped
        // and index 1 the second
        swapElements: (state, iAndJ) => {
            console.log(iAndJ[0] + " " + iAndJ[1]);
            state.commit("SWAP_ELEMENTS", iAndJ);
            state.commit("CLEAR_REDO");
        },
        removeElement: (state, index) => {
            state.commit("REMOVE_ELEMENT", index);
            state.commit("CLEAR_REDO");
        },
        editElement: (state, editedElement) => {
            console.log("in editElement action");
            state.commit("EDIT_ELEMENT", editedElement);
            state.commit("CLEAR_REDO");
        },
        
    }
};

export default PostCreateService;