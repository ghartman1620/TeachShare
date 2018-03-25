import { FileElement, FieldEnum } from "../../models";

export interface File {
    id: number;
    description: string;
    filetype: string;
    name: string;
    title: string;
    type: FieldEnum;
    url: string;
}

export interface FileState {
    files?: FileElement[];
    error: boolean;
}
