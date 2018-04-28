export const WatchStore = store => {
    // called when the store is initialized
    store.subscribe((mutation, state) => {
        console.log("Mutation: ", mutation);
        console.log("State: ", state);

        let splitNamespace = new RegExp('(.*)\/(.*)');
        const [ moduleName, mutationName ] = ((mutation.type as string).match(splitNamespace) as Array<string>).splice(1);
        console.log("REGEX RESULT: ", moduleName, mutationName);

        console.log(moduleName, mutationName)
        if (moduleName === "create") {
            console.log("[Create]: ", mutationName);
        } else if (moduleName === "user") {
            console.log("[User]: ", mutationName);
        }
    })
}
