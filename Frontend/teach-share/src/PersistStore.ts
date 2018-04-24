export const WatchStore = store => {
    // called when the store is initialized
    store.subscribe((mutation, state) => {
        console.log("Mutation: ", mutation);
        console.log("State: ", state);
        // called after every mutation.
        // The mutation comes in the format of `{ type, payload }`.
    })
}
