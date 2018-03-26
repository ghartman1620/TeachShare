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

    addElement(element: any): void{
        this.elements.push(element);
    }
    removeElement(index: number): void {
        this.elements.splice(index, 1);
    }
    insertElement(index: number, element): void {
        this.elements.splice(index, 0, element);
    }
    editElement(index: number, element): void{
        this.elements.splice(index, 1, element);
    }
    swapElements(i: number, j: number): void{
        var tmp: any = this.elements[i];
        this.elements[i] = this.elements[j];
        this.elements[j] = tmp;
    }
}