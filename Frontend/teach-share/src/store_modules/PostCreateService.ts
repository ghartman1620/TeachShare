import Vuex, { ActionContext } from "vuex";

import { IRootState } from "../models";
import InProgressPost from "../post";
import User from "../user";

// import { storeBuilder } from "../../store";

interface Mutation {
    mutation: string;
    arg: any;
}

interface PostState {
    post: InProgressPost | undefined;
    doneMutations: Mutation[];
    unDoneMutations: Mutation[];
}
interface EditedElement{
    element: any;
    index: number;
}

type PostContext = ActionContext<PostState, IRootState>;

const state: PostState = {
    post: undefined,
    doneMutations: [],
    unDoneMutations: [],
};

export const mutations = {
    SET_TAGS: (state: PostState, tags: string[]) => {
        state.post!.setTags(tags);
    },
    SET_TITLE: (state: PostState, newTitle: string) => {
        state.post!.setTitle(newTitle);
    },
    REMOVE_ATTACHMENT: (state: PostState, attachment: any) => {
        let ind = state.post!.attachments.findIndex(function (val) {
            return val === attachment.id;
        });
        if (ind !== -1) {
            state.post!.attachments.splice(ind, 1);
        }
    },
    ADD_ATTACHMENT: (state: PostState, attachment: any) => {
        state.post!.attachments.push(attachment.id);
    },
    UNDO: (state: PostState) => {
        state.doneMutations.pop();
    },
    REDO: (state: PostState) => {
        state.unDoneMutations.pop();
    },
    UNDO_ADD_ELEMENT: (state: PostState, index: number) => {
        state.unDoneMutations.push({
            mutation: "ADD_ELEMENT",
            arg: state.post!.elements[index]
        });
        state.post!.removeElement(index);
    },
    UNDO_REMOVE_ELEMENT: (state: PostState, arg: any) => {
        state.unDoneMutations.push({
            mutation: "REMOVE_ELEMENT",
            arg: arg.index
        });
        state.post!.insertElement(arg.index, arg.element);
    },
    UNDO_EDIT_ELEMENT: (state: PostState, arg: EditedElement) => {
        state.unDoneMutations.push({
            mutation: "EDIT_ELEMENT",
            arg: {
                index: arg.index,
                element: state.post!.elements[arg.index]
            }
        });
        state.post!.editElement(arg.index, arg.element);
    },
    UNDO_SWAP_ELEMENTS: (state: PostState, iAndJ: number[]) => {
        state.unDoneMutations.push({
            mutation: "SWAP_ELEMENTS",
            arg: iAndJ
        });
        var i = iAndJ[0];
        var j = iAndJ[1];
        state.post!.swapElements(i,j);
    },
    // Mutations for the currently edited post data:  and postElements
    ADD_ELEMENT: (state: PostState, element: any) => {
        state.doneMutations.push({
            mutation: "UNDO_ADD_ELEMENT",
            arg: state.post!.elements.length
        });
        state.post!.addElement(element);
    },
    SWAP_ELEMENTS: (state: PostState, iAndJ: number[]) => {
        console.log("swap elements");
        // I wrote this code because i'm triggered by being limited
        // to one function argument so I'm going to pretend I can pass two.
        state.doneMutations.push({
            mutation: "UNDO_SWAP_ELEMENTS",
            arg: iAndJ
        });
        var i = iAndJ[0];
        var j = iAndJ[1];
        state.post!.swapElements(i,j);
    },
    REMOVE_ELEMENT: (state: PostState, index: number) => {
        state.doneMutations.push({
            mutation: "UNDO_REMOVE_ELEMENT",
            arg: { element: state.post!.elements[index], index: index }
        });
        state.post!.removeElement(index);
    },
    EDIT_ELEMENT: (state: PostState, editedElement: any) => {
        state.doneMutations.push({
            mutation: "UNDO_EDIT_ELEMENT",
            arg: {
                element: state.post!.elements[editedElement.index],
                index: editedElement.index
            }
        });
        state.post!.editElement(editedElement.index, editedElement.element);
    },
    CLEAR_REDO: (state: PostState) => {
        Object.assign(state.unDoneMutations, []);
    },
    SAVE_DRAFT: (state: PostState) => {
        state.post!.saveDraft();
    },
    BEGIN_POST: (state: PostState, user: User) => {
        state.post = new InProgressPost(user);
    }
}

export const actions = {
    beginPost: (context: PostContext, user: User) => {
        context.commit("BEGIN_POST", user);
    },
    setTags: (context: PostContext, tags: string[]) => {
        context.commit("SET_TAGS", tags);
    },
    setTitle: (context: PostContext, title: string) => {
        context.commit("SET_TITLE", title);
    },
    undo: (context: PostContext) => {
        if (context.state.doneMutations.length > 0) {
            var mut =
                context.state.doneMutations[
                    context.state.doneMutations.length - 1
                ];
            if (mut.mutation === "UNDO_ADD_ELEMENT") {
                context.dispatch(
                    "removeAttachments",
                    context.state.post!.elements[mut.arg].content
                );
            }
            context.commit("UNDO");
            context.commit(mut.mutation, mut.arg);
            context.dispatch("saveDraft").then(res => console.error(res));
        }
    },
    redo: (context: PostContext) => {
        if (context.state.unDoneMutations.length > 0) {
            var mut =
                context.state.unDoneMutations[
                    context.state.unDoneMutations.length - 1
                ];
            if (mut.mutation === "ADD_ELEMENT") {
                console.error(
                    "REDO ADD ELEMENT: ",
                    context.state.unDoneMutations,
                    mut
                );

                console.error("Add attachments", "success");
                context.dispatch("addAttachments", mut.arg.content);
            }
            context.commit("REDO");
            context.commit(mut.mutation, mut.arg);
            context.dispatch("saveDraft").then(res => console.error(res));
        }
    },
    addElement: (context: PostContext, element: any) => {
        // clear order of actions from ADD_ELEMENT --> CLEAR_REDO --> saveDraft.
        context.commit("ADD_ELEMENT", element);
        context.commit("CLEAR_REDO");
        context.dispatch("saveDraft").then(res => console.error(res));
    },
    // Actions are only allowed to have one argument so iAndJ is
    // a list with index 0 as the first index to be swapped
    // and index 1 the second
    swapElements: (context: PostContext, iAndJ: number[]) => {
        console.log("swapElements");
        context.commit("SWAP_ELEMENTS", iAndJ);
        context.commit("CLEAR_REDO");
        context.dispatch("saveDraft").then(res => console.error(res));
    },
    removeElement: (context: PostContext, index: number) => {
        context.dispatch(
            "removeAttachments",
            context.state.post!.elements[index].content
        );
        context.commit("REMOVE_ELEMENT", index);
        context.commit("CLEAR_REDO");

        context.dispatch("saveDraft").then(res => console.error(res));
    },
    removeAttachments: (context: PostContext, attachments) => {
        for (var i in attachments) {
            let attachment = attachments[i];
            context.commit("REMOVE_ATTACHMENT", attachment);
        }
    },
    addAttachments: (state: PostContext, attachments) => {
        for (var i in attachments) {
            console.error(attachments[i]);
            let attachment = attachments[i];
            state.commit("ADD_ATTACHMENT", attachment);
        }
    },
    editElement: (context: PostContext, editedElement: EditedElement) => {
        context.commit("EDIT_ELEMENT", editedElement);
        context.commit("CLEAR_REDO");
        context.dispatch("saveDraft").then(res => console.error(res));
    },
    saveDraft: (ctx: PostContext) => {
        ctx.commit("SAVE_DRAFT");
    },
    createPost: (context: PostContext) => {
        return new Promise((resolve, reject) => {
            context.state.post!.publishPost().then(function(response){
                resolve(response);
            }).catch(function(error) { 
                reject(error);
            });
        });
        /*
        return new Promise((resolve, reject) => {
            console.log(postObj);
            api
                .post("posts/", postObj)
                .then(response => resolve(response))
                .catch(function(error) {
                    if (error.response) {
                        return resolve(error.response.data);
                    } else if (error.request) {
                        return resolve(error.request);
                    } else {
                        return resolve(error.message);
                    }
                });
        });*/
    },
}

const PostCreateService = {
    state,
    mutations,
    actions,
    getters: {
        getTags: (state: PostState) => state.post!.tags,
        getTitle: (state: PostState) => state.post!.title,
        getContent: (state: PostState) => state.post!.elements,
        getCurrentPost: (state: PostState) => state.post,
        getCurrentPostId: (state, getters) => {
            if (state.post !== null) {
                return getters.getCurrentPost.pk;
            }
            return null;
        },
        postElements: (state: PostState) => state.post!.elements,
    }
};

export default PostCreateService;
