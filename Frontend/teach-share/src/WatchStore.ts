export const WatchStore = store => {
    // called when the store is initialized
    store.subscribe((mutation, state) => {

        let splitNamespace = new RegExp('(.*)\/(.*)');
        const [ moduleName, mutationName ] = ((mutation.type as string).match(splitNamespace) as Array<string>).splice(1);

        if (moduleName === "create") {
        } else if (moduleName === "user") {
        }
    })
}
