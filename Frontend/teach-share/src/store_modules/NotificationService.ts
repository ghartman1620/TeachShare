import v4 from "uuid/v4";
import { ActionContext } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import { INotification, IRootState } from "../models";

export interface INotifyState {
    pending: INotification[];
    max: number;
    ttl: number;
}

type NotifyContext = ActionContext<INotifyState, IRootState>;

const state = {
    pending: [],
    max: 0,
    ttl: 0
};

export const mutations = {
    SEND: (ctx, notification) => {
        const current = ctx.pending.findIndex((v) => v === notification);
        if (current === -1) {
            notification.id = v4();
            ctx.pending.push(notification);
        } else {
            ctx.pending[current] = notification;
        }
    },
    REMOVE: (ctx, notificationID) => {
        const current = ctx.pending.findIndex((n) => n.id === notificationID);
        if (current !== -1) {
            ctx.pending.splice(current, 1);
        }
    }
};
export const actions = {
    sendNotification: (ctx, notification: INotification) => {
        mutSend(ctx, notification);
    },
    removeNotification: (ctx, notificationID: number) => {
        mutRemove(ctx, notificationID);
    }
};

export const getters = {
    getAllNotifications: (ctx) => ctx.pending,
    getAllSuccess: (ctx) => ctx.pending.filter((x) => x.type === "SUCCESS")
};

const NotificationService = {
    namespaced: true,
    strict: process.env.NODE_ENV !== "production",
    state,
    mutations,
    actions,
    getters
};

export default NotificationService;

/**
 * Type safe definitions for NotificationService
 */
const { commit, read, dispatch } = getStoreAccessors<INotifyState, IRootState>(
    "notify"
);

/**
 * Actions Handlers
 */
export const sendNotification = dispatch(
    NotificationService.actions.sendNotification
);
export const removeNotification = dispatch(
    NotificationService.actions.removeNotification
);
/**
 * Getters Handlers
 */
export const getAllNotifications = read(
    NotificationService.getters.getAllNotifications
);
export const getAllSuccess = read(NotificationService.getters.getAllSuccess);

/**
 * Mutations Handlers
 */
export const mutSend = commit(NotificationService.mutations.SEND);
export const mutRemove = commit(NotificationService.mutations.REMOVE);
