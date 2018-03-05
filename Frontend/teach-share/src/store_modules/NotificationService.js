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
        }
    },
    actions: {
        sendNotification: (state, notification) => {
            state.commit("SEND_NOTIFICATION", notification);
        }
    },
    getters: {
        getAllNotifications: state => state.pendingNotifications,
        getAllSuccess: state => filter(state.pendingNotifications, x => x.type === "SUCCESS")
    }
};

export default NotificationService;