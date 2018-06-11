import ReconnectingWebSocket from "reconnecting-websocket";
import api from "./api";
import Database, { IPostVersion } from "./Database";
import {Post} from "./models";

enum ReadyState {
    Connecting =  0,
    Open = 1,
    Closing = 2,
    Closed = 3,
}

enum MessageType {
    Get = "Get",
    Watch = "Watch",
    Update = "Update",
    Create = "Create",
    Manifest = "Manifest",
}

enum MessageStatus {
    Sucess = 0,
    ConnectionClosed = 1,
    ConnectionOpening = 2,
}

class MockWebSocket {
    public receiveListeners: ((message: any) => undefined)[];
    public readyState: ReadyState = ReadyState.Connecting;
    private openListeners: ((event: any) => undefined)[];
    public constructor(s: string) {
        this.openListeners = [];
        this.receiveListeners = [];
        window.setTimeout(1000, this.open());
    }
    public open() {
        this.readyState = ReadyState.Open;
        for (const fn of this.openListeners) {
            fn!({});
        }
    }
    public addEventListener(type: string, listener: (e) => undefined) {
        if (type === "open") {
            this.openListeners.push(listener);
        } else if (type === "message") {
            this.receiveListeners.push(listener);
        } else {
            console.error("only message and open are valid listeners for MockWebSocket");
        }
    }

    public send(msg: string): void {
        const val = JSON.parse(msg);
        if (val.message !== MessageType.Get) {
            console.error("Non-get type message sent over Mock Websocket");
        } else {
            const ws: MockWebSocket = this as MockWebSocket;
            api.get("/posts/" + val.id).then((response) => {
                for (const fn of ws.receiveListeners) {
                    fn!({data: JSON.stringify(response.data)});
                }
            });
        }
    }
}

export default class WebSocket {
    public static getInstance(): WebSocket {
        if (WebSocket.instance == null) {
            WebSocket.instance = new WebSocket();
        }
        return WebSocket.instance;
    }
    private static instance: WebSocket;
    private rws: ReconnectingWebSocket;
    private constructor() {
        this.rws = new ReconnectingWebSocket("ws://127.0.0.1:3012");

    }

    // in all sender functions, if the websocket is still connecting we'll add
    // the message the caller wants to send as a listener to the open event.
    // All return a MessageStatus - if MessageStatus is ConnectionOpening the message will
    // be sent later, as soon as the websocket has completed opening.
    public sendCreate(p: Post): MessageStatus {
        return this.send({
            message: MessageType.Create,
            post: p.toApiObject()
        });
    }
    public sendUpdate(p: Post): MessageStatus {
        const changed = p.toApiObject();
        // little hack to fix weird string id situation for user_id.
        (changed as any).user_id = parseInt((changed as any).user_id, 10);
        return this.send({
            message: MessageType.Update,
            post: changed
        });
        // console.error("Update message sent - not yet implemented!");
        // return MessageStatus.ConnectionClosed;
    }
    public sendWatch(id: number): MessageStatus {
        return this.send({
            message: MessageType.Watch,
            id
        });
        // return MessageStatus.ConnectionClosed;

    }
    public sendGet(id: number): MessageStatus {
        return this.send({
            message: MessageType.Get,
            id,
        });
    }
    public async sendManifest() {
        Database.getInstance().manifest().then((manifest) => {
            this.send({
                message: MessageType.Manifest,
                manifest,
            });
        });
        if (this.rws.readyState === ReadyState.Connecting) {
            return MessageStatus.ConnectionOpening;
        } else if (this.rws.readyState === ReadyState.Open) {
            return MessageStatus.Sucess;
        } else {
            return MessageStatus.ConnectionClosed;
        }

    }


    public addOpenListener(fn: (any) => undefined) {
        this.rws.addEventListener("open", fn);
    }

    public addMessageListener(fn: (any) => undefined) {
        this.rws.addEventListener("message", fn);
    }
    private send(val): MessageStatus {
        const msg = JSON.stringify(val);
        console.log("WEBSOCKET: sendimg essage");
        console.log(val);
        if (this.rws.readyState ===  ReadyState.Connecting) {
            this.addOpenListener((event) => {
                this.rws.send(msg);
                return undefined;
            });
            return MessageStatus.ConnectionOpening;
        } else if (this.rws.readyState !== ReadyState.Open) {
            console.error("WebSocket error: send called on closing connection");
            return MessageStatus.ConnectionClosed;
        } else {
            this.rws.send(msg);
            return MessageStatus.Sucess;
        }
    }
}
WebSocket.getInstance().sendManifest();
Database.getInstance().manifest().then((idAndVersions: IPostVersion[]) => {
    const ws = WebSocket.getInstance();
    for (const idAndVersion of idAndVersions) {
        if (idAndVersion !== undefined) {
            ws!.sendWatch(idAndVersion!.id);
        }
    }
});
