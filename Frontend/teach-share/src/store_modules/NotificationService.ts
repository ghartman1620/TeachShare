import v4 from "uuid/v4";

// NotificationService definition -- this is where you send and remove
// notifications from. Generally speaking, all you have to do is that.
//
// @TODO: make them 'time-out', so that it disappears eventually on it's own.
const NotificationService = {
    state: {
        pendingNotifications: []
    },
    mutations: {
        SEND_NOTIFICATION: (state, notification) => {
            let current = state.pendingNotifications.findIndex(v => v == notification);
            if (current === -1) {
                notification.id = v4();
                state.pendingNotifications.push(notification);
            } else {
                state.pendingNotifications[current] = notification;
            }
        },
        REMOVE_NOTIFICATION: (state, notificationID) => {
            let current = state.pendingNotifications.findIndex(n => n.id === notificationID);
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
        getAllSuccess: state => state.pendingNotifications.filter(x => x.type === "SUCCESS")
    }
};

export default NotificationService;