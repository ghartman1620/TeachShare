import Vue from "vue";
import api from "./api";
import User from "./user";
import { AxiosResponse } from "axios";
interface PostElement{
    type: string;
}

interface TextElement extends PostElement {
    content: string;
}

interface AudioElement extends PostElement {

}

export default class InProgressPost{
    public elements: any[];
    public title: string;
    public tags: string[];
    public userPk: number;
    public attachments: any[];
    public pk: number = -1; // -1 if post is not yet saved as draft

    constructor(user: User){
        this.elements = [];
        this.title = "";
        this.tags = [];
        this.userPk = user.pk;
        this.attachments = [];
        console.log(user);
        console.log("new post constructor");
        this.createDraft();
    }
    public setTags(tags: string[]): void {
        this.tags = tags;
    }
    public setTitle(title: string): void {
        this.title = title;
    }
    public setAttachments(attachments: any[]): void {
        this.attachments = attachments;
    }

    public addElement(element: any): void {
        this.elements.push(element);
    }
    public removeElement(index: number): void {
        this.elements.splice(index, 1);
    }
    public insertElement(index: number, element): void {
        this.elements.splice(index, 0, element);
    }
    public editElement(index: number, element): void{
        this.elements.splice(index, 1, element);
    }
    public swapElements(i: number, j: number): void{
        const tmp: any = this.elements[i];
        Vue.set(this.elements, i, this.elements[j]);
        Vue.set(this.elements, j, tmp);
    }
    public printElements() {
        let print: string = "";
        for (const ele in this.elements) {
            if (typeof ele !== "undefined") {
                print += ele.toString() + " " ;
            }
        }
        console.log(print);
    }
    public createDraft() {
        const post: InProgressPost = this;
        const obj = this.json(true);
        console.log("CREATING DRAFT");
        api.post("posts/", obj).then((response) => {
            console.log(response);
            post.pk = response.data.pk;
        });
    }
    public json(draft: boolean): any {
        return {
            user: this.userPk,
            title: this.title,
            content: this.elements,
            likes: 0,
            comments: [],
            tags: this.tags,
            attachments: this.attachments,
            content_type: 0,
            grade: 0,
            length: 0,
            draft,
        };
    }
    public saveDraft(): void {
        api.put("posts/" + this.pk + "/", this.json(true)).then((response) => {
            console.log("DRAFT SAVED!");
        });
    }
    public async publishPost(): Promise<any> {
        try {
            const result: AxiosResponse<this> = await api.put("posts/" + this.pk + "/", this.json(false));
            return result;
        } catch (err) {
            return err;
        }
    }
}
