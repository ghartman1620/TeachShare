import ReconnectingWebSocket from "reconnecting-websocket";
import Database from "./Database";
import store from "./store";
import {mutUpdate, mutCreate, getMap} from "./store_modules/PostService";
import {Post} from "./models";

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

export default class WebSocket {
    private static instance: WebSocket;
    private rws: ReconnectingWebSocket;
    private constructor() {
        this.rws = new ReconnectingWebSocket('ws://127.0.0.1:3012');
        this.addMessageListener(this.onmessage);
        console.log("constructed websocket");
        this.rws.addEventListener("open", (msg)=>{
            console.log(msg);

            return undefined;
        });
    }
    public static getInstance(): WebSocket {
        if(WebSocket.instance == null){
            WebSocket.instance = new WebSocket();
        }
        return WebSocket.instance;
    }

    

    //in all sender functions, if the websocket is still connecting we'll add
    //the message the caller wants to send as a listener to the open event.
    //All return a MessageStatus - if MessageStatus is ConnectionOpening the message will
    //be sent later, as soon as the websocket has completed opening.
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
            id: id
        });
    }
    public sendGet(id: number): MessageStatus{
        return this.send({
            message: MessageType.Get,
            id: id
        });
    }

    private send(val): MessageStatus{
        console.log(this.rws.readyState);
        let msg = JSON.stringify(val);
        if(this.rws.readyState ===  0){
            console.log("waiting");
            this.addOpenListener((event) => {
                console.log(msg);
                this.rws.send(msg);
                return undefined;
            })
            return MessageStatus.ConnectionOpening;
        }
        else if(this.rws.readyState !== 1){
            console.log("WebSocket error: send called on closing connection");
            return MessageStatus.ConnectionClosed;
        }
        else{
            this.rws.send(msg);
            return MessageStatus.Sucess;
        }
    }

    public addOpenListener(fn: (any) => undefined){
        this.rws.addEventListener("open", fn);
    }

    public addMessageListener(fn: (any) => undefined){
        this.rws.addEventListener("message", fn);
    }
    
    private onmessage(msg): undefined {
        let val = Post.pkify(JSON.parse(msg.data));
        console.log(val);
        var db: Database = Database.getInstance();
        db.getPost(val.pk as number).then(p => {
            db.putPost(val);
        })


        if(getMap(store).has(val.pk!.toString())){
            mutUpdate(store, val);
        }else{
            mutCreate(store, val);
        }
        return undefined;
    }
}