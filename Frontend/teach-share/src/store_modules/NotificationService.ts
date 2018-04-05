import v4 from "uuid/v4";
import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import { RootState, Notification, NotifyType } from "../models";

export interface NotifyState {
    pending: Notification[];
    max: number;
    ttl: number;
}

type NotifyContext = ActionContext<NotifyState, RootState>;

const state = {
    pending: [],
    max: 0,
    ttl: 0
};

export const mutations = {
    SEND: (state, notification) => {
        let current = state.pending.findIndex(v => v == notification);
        if (current === -1) {
            notification.id = v4();
            state.pending.push(notification);
        } else {
            state.pending[current] = notification;
        }
    },
    REMOVE: (state, notificationID) => {
        let current = state.pending.findIndex(n => n.id === notificationID);
        if (current !== -1) {
            state.pending.splice(current, 1);
        }
    }
};
export const actions = {
    sendNotification: (state, notification: Notification) => {
        mutSend(state, notification);
    },
    removeNotification: (state, notificationID: number) => {
        mutRemove(state, notificationID);
    }
};

export const getters = {
    getAllNotifications: state => state.pending,
    getAllSuccess: state => state.pending.filter(x => x.type === "SUCCESS")
};

const NotificationService = {
    // scoped: true,
    // strict: process.env.NODE_ENV !== 'production',
    state,
    mutations,
    actions,
    getters
};

export default NotificationService;

/**
 * Type safe definitions for NotificationService
 */
const { commit, read, dispatch } = getStoreAccessors<NotifyState, RootState>(
    ""
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
