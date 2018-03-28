import { Comment } from "../../models";

export interface CommentState {
    comments?: { [id: number]: Comment };
}
