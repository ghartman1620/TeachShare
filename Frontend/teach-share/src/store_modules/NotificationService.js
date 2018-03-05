import findIndex from "lodash/findIndex";
import filter from "lodash/filter";
import v4 from "uuid/v4";

// NotificationService definition
const NotificationService = {
    state: {
        pendingNotifications: []
    },
    mutations: {
        SEND_NOTIFICATION: (state, notification) => {
            console.log("SEND_NOTIFICATION: ", notification);
            let current = findIndex(state.pendingNotifications, (v) => v == notification);
            console.log("CURRENT: ", current);
            if (current === -1) {
                notification.id = v4();
                let val = state.pendingNotifications.push(notification);
                console.log("VAL: ", val);
                console.log(state.pendingNotifications);
            } else {
                state.pendingNotifications[current] = notification;
            }
        },
        REMOVE_NOTIFICATION: (state, notificationID) => {
            console.log(notificationID);
            let current = findIndex(state.pendingNotifications, (n) => n.id === notificationID);
            console.log(current);
            if (current !== -1) {
                state.pendingNotifications.splice(current, 1);
            }
        }
    },
    actions: {
        sendNotification: (state, notification) => {
            state.commit("SEND_NOTIFICATION", notification);
        },
        removeNotification: (state, notificationID) => {
            state.commit("REMOVE_NOTIFICATION", notificationID);
        }
    },
    getters: {
        getAllNotifications: state => state.pendingNotifications,
        getAllSuccess: state => filter(state.pendingNotifications, x => x.type === "SUCCESS")
    }
};

export default NotificationService;