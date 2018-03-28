import { GenericFile, ModelMap } from "../../models";

export interface FileState {
    files?: ModelMap<GenericFile>;
    limit: number;
}
