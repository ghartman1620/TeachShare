import { FileElement, FieldEnum } from "../../models";

export interface FileState {
    files?: { [id: number]: FileElement };
    limit: number;
}
