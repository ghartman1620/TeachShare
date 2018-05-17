import ReconnectingWebSocket from "reconnecting-websocket";
import api from "./api";
import Database from "./Database";
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
    Create = "Create"
}

enum MessageStatus {
    Sucess = 0,
    ConnectionClosed = 1,
    ConnectionOpening = 2,
}

class MockWebSocket {
    private openListeners: ((event: any) => undefined)[];
    public receiveListeners: ((message: any) => undefined)[];
    public readyState: ReadyState = ReadyState.Connecting;
    constructor(s: string){
        this.openListeners = [];
        this.receiveListeners = [];
        window.setTimeout(1000, this.open());
    }
    open() {
        this.readyState = ReadyState.Open;
        for(var fn of this.openListeners) {
            fn!({});
        }
    }
    addEventListener(type: string, listener: (e) => undefined) {
        console.log("adding eventr listener to mock socket");
        if(type === "open"){
            console.log("adding open listener to mock socket");
            this.openListeners.push(listener);
        }
        else if (type === "message"){
            console.log("adding message listener to mock socket");
            this.receiveListeners.push(listener);
        }
        else{
            console.error("only message and open are valid listeners for MockWebSocket");
        }
    }

    public send(msg: string): void {
        console.log("sent message");
        console.log(msg);
        let val = JSON.parse(msg);
        if (val.message !== MessageType.Get) {
            console.error("Non-get type message sent over Mock Websocket");
        } else {
            const ws: MockWebSocket = this as MockWebSocket;
            api.get("/posts/" + val.id).then( (response) => {
                console.log("got \"reply\"");
                console.log(response);
                console.log(ws.receiveListeners.length);
                for (var fn of ws.receiveListeners) {
                    console.log("calling fn");
                    console.log(fn);
                    // fn!.apply(null, {data: response.data});
                    console.log("calling fn again");
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
        this.addMessageListener(this.onmessage);
        console.log("constructed websocket");
        this.rws.addEventListener("open", (msg) => {
            console.log(msg);

            return undefined;
        });
    }

    // in all sender functions, if the websocket is still connecting we'll add
    // the message the caller wants to send as a listener to the open event.
    // All return a MessageStatus - if MessageStatus is ConnectionOpening the message will
    // be sent later, as soon as the websocket has completed opening.
    public sendCreate(p: Post): MessageStatus {
        return this.send({
            message: MessageType.Create,
            post: p.idify()
        });
    }
    public sendUpdate(p: Post): MessageStatus{
        return this.send({
            message: MessageType.Update,
            post: p.idify()
        });
    }
    public sendWatch(id: number): MessageStatus {
        return this.send({
            message: MessageType.Watch,
            id
        });
        // return MessageStatus.ConnectionClosed;
    }
    public sendGet(id: number): MessageStatus {
        console.log("sending get");
        return this.send({
            message: MessageType.Get,
            id
        });
    }

    public addOpenListener(fn: (any) => undefined) {
        this.rws.addEventListener("open", fn);
    }

    public addMessageListener(fn: (any) => undefined) {
        console.log("added message listener");
        console.log(fn);
        this.rws.addEventListener("message", fn);
    }

    private send(val): MessageStatus {
        console.log(this.rws.readyState);
        let msg = JSON.stringify(val);
        if (this.rws.readyState ===  ReadyState.Connecting) {
            console.log("waiting");
            this.addOpenListener((event) => {
                console.log(msg);
                this.rws.send(msg);
                return undefined;
            });
            return MessageStatus.ConnectionOpening;
        } else if (this.rws.readyState !== ReadyState.Open) {
            console.log("WebSocket error: send called on closing connection");
            return MessageStatus.ConnectionClosed;
        } else {
            console.log("sent message");
            this.rws.send(msg);
            return MessageStatus.Sucess;
        }
    }
    private onmessage(msg): undefined {
        return undefined;
    }
}
