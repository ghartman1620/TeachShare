export class Post{

    elements: any[];
    title: string;
    tags: string[];
    user: number;
    constructor(){
        this.elements = [];
        this.title = "";
        this.tags = [];
        this.user = 0;
    }
    setTags(tags: string[]): void {
        this.tags = tags;
    }
    setTitle(title: string): void {
        this.title = title;
    }

}