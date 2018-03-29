import { Comment, ModelMap } from "../../models";

export interface CommentState {
    comments?: ModelMap<Comment>;
}
