import { Notification } from "../../models";

export interface NotifyState {
    pending: Notification[]
    max: number;
    ttl: number;
}
