
import { InProgressPost } from "../post";
import User from "../user";

import { getStoreBuilder } from "vuex-typex"
import Vuex, { Store, ActionContext } from "vuex"

import { IRootState } from "../models";
import { getStoreAccessors } from "vuex-typescript";


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
interface EditedElement {
    element: any;
    index: number;
}
interface BeginPostObj {
    userid: number;
    id?: number;
}

export type PostContext = ActionContext<PostState, IRootState>;

const state: PostState = {
    post: undefined,
    doneMutations: [],
    unDoneMutations: []
};

export const mutations = {
    SET_TAGS: (state: PostState, tags: string[]) => {
        state.post!.setTags(tags);
    },
    SET_LAYOUT: (state: PostState, layout: Object[]) => {
        state.post!.setLayout(layout);
    },
    SET_COLOR: (state: PostState, color: string) => {
        state.post!.setColor(color);
    },
    SET_TITLE: (state: PostState, newTitle: string) => {
        state.post!.setTitle(newTitle);
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
        state.post!.swapElements(i, j);
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
        state.post!.swapElements(i, j);
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
    BEGIN_POST: (state: PostState, arg: BeginPostObj) => {
        if(arg.id == undefined){
            state.post = new InProgressPost(arg.userid);
        }
        else{
            state.post = new InProgressPost(arg.userid, <number>arg.id);
        }
    },
    SET_GRADE: (state: PostState, grade: number) => {
        state.post!.setGrade(grade);
    },
    SET_CONTENT_TYPE: (state: PostState, contentType: number) => {
        state.post!.setContentType(contentType);
    },
    SET_SUBJECT: (state: PostState, subject: number) => {
        state.post!.setSubject(subject);
    },
    SET_LENGTH: (state: PostState, length: number) => {
        state.post!.setLength(length);
    },

};

export const actions = {
    beginPost: (context: PostContext, arg: BeginPostObj) => {
        context.state.post = undefined;
        mutBeginPost(context, arg);
        // context.commit("BEGIN_POST", user);
    },
    setTags: (context: PostContext, tags: string[]) => {
        mutSetTags(context, tags);
        // context.commit("SET_TAGS", tags);
    },
    setLayout: (context: PostContext, layout: Object[]) => {
        mutSetLayout(context, layout);
    },
    setColor: (context: PostContext, color: string) => {
        mutSetColor(context, color);
    },
    setTitle: (context: PostContext, title: string) => {
        mutSetTitle(context, title);
        // context.commit("SET_TITLE", title);
    },
    undo: async (context: PostContext) => {
        if (context.state.doneMutations.length > 0) {
            var mut =
                context.state.doneMutations[
                    context.state.doneMutations.length - 1
                ];
            if (mut.mutation === "UNDO_ADD_ELEMENT") {
                removeAttachments(
                    context,
                    context.state.post!.elements[mut.arg].content
                );
                // context.dispatch(
                //     "removeAttachments",
                //     context.state.post!.elements[mut.arg].content
                // );
            }
            mutUndo(context);
            // context.commit("UNDO");

            // @TODO: can this one even be replaced!?
            context.commit(mut.mutation, mut.arg);

            const response = await saveDraft(context).catch(err =>
                console.error(err)
            );
            console.log(response);
            // context.dispatch("saveDraft").then(res => console.error(res));
        }
    },
    redo: (context: PostContext) => {
        if (context.state.unDoneMutations.length > 0) {
            let mut =
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
            context.state
                .post!.publishPost()
                .then(function(response) {
                    resolve(response);
                })
                .catch(function(error) {
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
    setGrade: (context: PostContext, grade: number) => {
        context.commit("SET_GRADE", grade);
        context.dispatch("saveDraft");
    },
    setContentType: (context: PostContext, contentType: number) => {
        context.commit("SET_CONTENT_TYPE", contentType);
        context.dispatch("saveDraft");
    },
    setSubject: (context: PostContext, subject: number) => {
        context.commit("SET_SUBJECT", subject);
        context.dispatch("saveDraft");
    },
    setLength: (context: PostContext, length: number) => {
        context.commit("SET_LENGTH", length);
        context.dispatch("saveDraft");
    }
    
};

export const getters = {
    getTags: (state: PostState) => { 
        if (typeof state.post !== "undefined") {
            return state.post!.tags;
        }
        return undefined;
    },
    getLayout: (state: PostState) => {
        if (typeof state.post !== "undefined") {
            return state.post!.layout;
        }
        return undefined;
    },
    getColor: (state: PostState) => {
        if (typeof state.post !== "undefined") {
            return state.post!.color;
        }
        return undefined;
    },
    getTitle: (state: PostState) => {
        if (typeof state.post !== "undefined") {
            return state.post!.title;
        }
        return undefined;
    },
    getContent: (state: PostState) => {
        if (typeof state.post !== "undefined") {
            return state.post!.elements;
        }
        return undefined;
    },
    getCurrentPost: (state: PostState) => state.post,
    getCurrentPostId: (state, getters) => {
        if (state.post !== null && typeof getters.getCurrentPost !== "undefined") {
            return getters.getCurrentPost.pk;
        }
        return null;
    },
    postElements: (state: PostState) => {
        if (typeof state.post !== "undefined") {
            return state.post!.elements;
        }
    },
};

const PostCreateService = {
    namespaced: true,
    strict: process.env.NODE_ENV !== "production",
    state,
    mutations,
    actions,
    getters
};

export default PostCreateService;

/**
 * Type safe definitions for FileService
 */
const { commit, read, dispatch } = getStoreAccessors<PostState, IRootState>(
    "create"
);

/**
 * Action Handlers
 */

export const addElement = dispatch(PostCreateService.actions.addElement);
export const beginPost = dispatch(PostCreateService.actions.beginPost);
export const setTags = dispatch(PostCreateService.actions.setTags);
export const setLayout = dispatch(PostCreateService.actions.setLayout);
export const setColor = dispatch(PostCreateService.actions.setColor);
export const setTitle = dispatch(PostCreateService.actions.setTitle);
export const undo = dispatch(PostCreateService.actions.undo);
export const redo = dispatch(PostCreateService.actions.redo);
export const swapElements = dispatch(PostCreateService.actions.swapElements);
export const removeElement = dispatch(PostCreateService.actions.removeElement);
export const removeAttachments = dispatch(
    PostCreateService.actions.removeAttachments
);
export const setGrade = dispatch(PostCreateService.actions.setGrade);
export const setLength = dispatch(PostCreateService.actions.setLength);
export const setContentType = dispatch(PostCreateService.actions.setContentType);
export const setSubject = dispatch(PostCreateService.actions.setSubject);

export const addAttachments = dispatch(
    PostCreateService.actions.addAttachments
);
export const editElement = dispatch(PostCreateService.actions.editElement);
export const saveDraft = dispatch(PostCreateService.actions.saveDraft);
export const createPost = dispatch(PostCreateService.actions.createPost);

/**
 * Getter Handlers
 */
export const getTags = read(PostCreateService.getters.getTags);
export const getLayout = read(PostCreateService.getters.getLayout);
export const getColor = read(PostCreateService.getters.getColor);
export const getTitle = read(PostCreateService.getters.getTitle);
export const getContent = read(PostCreateService.getters.getContent);
export const getCurrentPost = read(PostCreateService.getters.getCurrentPost);
export const getCurrentPostId = read(
    PostCreateService.getters.getCurrentPostId
);
export const postElements = read(PostCreateService.getters.postElements);

/**
 * Mutations Handlers
 *
 * This also makes them really easily testable.
 */

export const mutAddElement = commit(PostCreateService.mutations.ADD_ELEMENT);
export const mutBeginPost = commit(PostCreateService.mutations.BEGIN_POST);
export const mutClearRedo = commit(PostCreateService.mutations.CLEAR_REDO);
export const mutEditElement = commit(PostCreateService.mutations.EDIT_ELEMENT);
export const mutRedo = commit(PostCreateService.mutations.REDO);
export const mutRemoveElement = commit(
    PostCreateService.mutations.REMOVE_ELEMENT
);
export const mutSaveDraft = commit(PostCreateService.mutations.SAVE_DRAFT);
export const mutSetTags = commit(PostCreateService.mutations.SET_TAGS);
export const mutSetLayout = commit(PostCreateService.mutations.SET_LAYOUT);
export const mutSetColor = commit(PostCreateService.mutations.SET_COLOR);
export const mutSetTitle = commit(PostCreateService.mutations.SET_TITLE);
export const mutSwapElements = commit(
    PostCreateService.mutations.SWAP_ELEMENTS
);
export const mutUndo = commit(PostCreateService.mutations.UNDO);
export const mutUndoAddElement = commit(
    PostCreateService.mutations.UNDO_ADD_ELEMENT
);
export const mutUndoEditElement = commit(
    PostCreateService.mutations.UNDO_EDIT_ELEMENT
);
export const mutUndoRemoveElement = commit(
    PostCreateService.mutations.UNDO_REMOVE_ELEMENT
);
export const mutUndoSwapElements = commit(
    PostCreateService.mutations.UNDO_SWAP_ELEMENTS
);
