/*!
 The websocket cache service is used for realtime communication between connected users.
*/
#![feature(vec_remove_item)]
#![warn(clippy)]
#![feature(extern_prelude)]

extern crate pretty_env_logger;
#[macro_use]
extern crate log;
extern crate chrono;
extern crate time;
extern crate ws;
#[macro_use]
extern crate serde_derive;
extern crate dotenv;
extern crate serde_json;
#[macro_use]
extern crate crossbeam_channel;
#[macro_use]
extern crate diesel;
use std::fmt;
use ws::{listen, CloseCode, Error, Handler, Handshake, Message, Sender};

mod cache;
mod db;
mod models;
mod pool;
mod schema;
mod users;

use cache::*;
use db::save_posts;
use models::*;

use chrono::{DateTime, Duration, Local, NaiveTime, Utc};
use db::DB;
use diesel::pg::PgConnection;
use log::Level;
use models::MessageType;
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::error::Error as StdError;
use std::rc::Rc;
use std::sync::Arc;
use std::thread;
use users::{Oauth2ProviderAccesstoken, User};

#[derive(Debug, Clone)]
struct GrandSocketStation {
    // represents the list of connections
    connections: Vec<Rc<Connection>>,
    auth_table: BTreeMap<String, Oauth2ProviderAccesstoken>,
}

impl GrandSocketStation {
    pub fn new(conn: &PgConnection) -> GrandSocketStation {
        let auth = match Oauth2ProviderAccesstoken::build_user_table_cached(conn) {
            Some(val) => val,
            None => BTreeMap::new(),
        };
        if log_enabled!(Level::Info) && !auth.is_empty() {
            info!("User Table:");
            for (i, (token, a)) in auth.iter().enumerate() {
                let difference = a.expires - Utc::now();
                let hours = difference.num_hours();
                let difference = difference - Duration::hours(hours);
                let min = difference.num_minutes();
                info!(
                    "{:?}.) [token: {:?} -> user: {:?}, expires in {} hours and {} minutes]",
                    i + 1,
                    token,
                    a.user_id,
                    hours,
                    min
                );
            }
        } else {
            warn!("No users have a valid token. (Nobody is logged in)");
        }
        GrandSocketStation {
            connections: vec![],
            auth_table: auth,
        }
    }
    pub fn get_connections(&self) -> &Vec<Rc<Connection>> {
        &self.connections
    }
    pub fn get_connections_mut(&mut self) -> &mut Vec<Rc<Connection>> {
        &mut self.connections
    }
    pub fn push_connection(&mut self, conn: Connection) {
        self.connections.push(Rc::new(conn))
    }

    pub fn check_token(&self, token: String) {
        self.auth_table.get(&token);
    }
}

impl std::cmp::PartialEq for Connection {
    fn eq(&self, rhs: &Connection) -> bool {
        self.id == rhs.id
    }
}

#[derive(Clone)]
struct Connection {
    parent: Option<Rc<RefCell<GrandSocketStation>>>,
    user: Option<User>,
    id: i32,
    tx: Sender,
    to_cache: crossbeam_channel::Sender<Arc<Msg>>,
    from_cache: crossbeam_channel::Receiver<Arc<Msg>>,
    kill_cache: crossbeam_channel::Sender<Cancel>,
}

impl fmt::Debug for Connection {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Connection ID: {}, sender: {}",
            self.id,
            self.tx.connection_id()
        )
    }
}

#[derive(Serialize, Deserialize, Debug)]
enum IdOrPost {
    Id(i32),
    Post(models::Post),
}

pub type Version = u64;
pub type ID = i32;

#[derive(Serialize, Deserialize, Debug)]
struct WSMessage {
    message: MessageType,
    id: Option<i32>,
    post: Option<models::Post>, //id_or_post: IdOrPost
    manifest: Option<Vec<IdAndVersion>>,
    version: Option<u64>,
}

impl Handler for Connection {
    fn on_open(&mut self, hs: Handshake) -> ws::Result<()> {
        info!("client connected.");
        for (key, value) in hs.request.headers() {
            info!("{:?}: {:?}", key, String::from_utf8(value.clone()));
        }

        // find the user...
        let token = hs.request.header("Cookie");
        token.and_then(|tok| {
            let cookie_str = String::from_utf8(tok.clone()).unwrap();
            let cookie_entries: Vec<&str> = cookie_str.split(";").collect();
            let token_entry: Vec<&str> = cookie_entries[6].split("=").collect();
            let token: String = token_entry[1].to_owned();
            debug!("Cookie entries: {:?}", cookie_entries);
            debug!("Token: {:?}", token);
            let u = User::new();
            let out = match &self.parent {
                Some(val) => match val.try_borrow_mut() {
                    Ok(parent) => {
                        debug!("Parent --> {:?}", parent);
                        Ok(parent)
                    }
                    Err(e) => {
                        error!("There was an error! {}", e);
                        Err(GSSError::from(e))
                    }
                },
                None => {
                    error!("Could not borrow parent as a mutable reference!");
                    Err(GSSError::GetParent)
                }
            };
            println!("test test test");
            info!("got parent! {:?}", out);
            let p = out.unwrap();
            let table: &BTreeMap<String, Oauth2ProviderAccesstoken> = &p.auth_table;
            debug!("Table: {:?}", table);

            if table.contains_key(&token) {
                let test = &p.auth_table[&token];
                info!("FOUND USER OAUTH2 ENTRY: {:?}", test);
            } else {
                warn!("Oath2 Entry does not exist for token. Could be expired.");
            }
            // Oauth2ProviderAccesstoken::get_by_token(tok, )
            // self.set_user(u);
            Some(u)
        });

        Ok(())
    }

    fn on_message(&mut self, msg: Message) -> ws::Result<()> {
        match msg {
            Message::Binary(_) => {
                warn!("Received binary message. Doing nothing with it.");
            } // ..
            Message::Text(text) => {
                let json: Result<WSMessage, serde_json::Error> = serde_json::from_str(&text);
                let response: Option<String> = match json {
                    Ok(msg) => match msg.message {
                        MessageType::Get => self.handle_get_msg(msg),
                        MessageType::Create => self.handle_create_msg(msg),
                        MessageType::Watch => self.handle_watch_msg(msg),
                        MessageType::Update => self.handle_update_msg(msg),
                        MessageType::Manifest => self.handle_manifest_msg(msg),
                    },
                    Err(e) => Some(format!(
                        "There is a terrible error parsing {:?}: {:?}",
                        text, e
                    )),
                };
                if let Some(error_msg) = response {
                    error!("There was an error: {:?}", error_msg);
                }
            }
        };
        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        match code {
            CloseCode::Normal => {
                info!("The client is done with the connection.");
                self.remove_client();
            }
            CloseCode::Away => {
                info!("The client is leaving the site.");
                self.remove_client();
            }
            CloseCode::Abnormal => {
                info!("Closing handshake failed! Unable to obtain closing status from client.");
                self.remove_client();
            }
            _ => warn!("The client encountered an unknown error: {}", reason),
        }
    }

    fn on_error(&mut self, err: Error) {
        error!("The server encountered an error: {:?}", err);
    }
}

#[derive(Debug)]
pub enum GSSError {
    GetParent,
    Unknown,
}

impl fmt::Display for GSSError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            GSSError::GetParent => f.write_str("Get parent error."),
            GSSError::Unknown => f.write_str("Unknown GSS error."),
        }
    }
}

impl StdError for GSSError {
    fn description(&self) -> &str {
        match *self {
            GSSError::GetParent => "Could not mutably borrow parent.",
            GSSError::Unknown => "Unknown error handling GrandSocketStation instance.",
        }
    }
}

impl From<std::cell::BorrowMutError> for GSSError {
    fn from(e: std::cell::BorrowMutError) -> Self {
        GSSError::GetParent
    }
}

impl Connection {
    fn set_user(&mut self, u: User) {
        self.user = Some(u);
    }

    // @FIXME: Fix this (may not be plausible to have a borrowed value returned...)
    // fn get_parent(&self) -> Result<&GrandSocketStation, GSSError> {
    //     match &conn.parent {
    //         Some(val) => match val.try_borrow_mut() {
    //             Ok(parent) => {
    //                 debug!("Parent --> {:?}", parent);
    //                 Ok(&parent)
    //             },
    //             Err(e) => {
    //                 error!("There was an error! {}", e);
    //                 Err(GSSError::from(e))
    //             },
    //         },
    //         None => {
    //             error!("Could not borrow parent as a mutable reference!");
    //             Err(GSSError::GetParent)
    //         },
    //     }
    // }

    fn remove_client(&mut self) {
        debug!(
            "[GrandSocketStation] Removing 'self' from GrandSocketStation: {:?}",
            self.id
        );
        match &mut self.parent {
            Some(val) => match val.try_borrow_mut() {
                Ok(ref mut parent) => {
                    debug!(
                        "[GrandSocketStation] [{:?}] Current Connections: {:?}",
                        parent.connections.len(),
                        parent.connections,
                    );
                    let mut exiting_connection_id = 0;
                    let old_connection_id = self.tx.connection_id();
                    {
                        exiting_connection_id = parent
                            .connections
                            .clone()
                            .into_iter()
                            .position(|x| x.tx.connection_id() == old_connection_id)
                            .unwrap();
                    }
                    parent.connections.remove(exiting_connection_id);
                    debug!(
                        "[GrandSocketStation] [{:?}] Current Remaining Connections: {:?}",
                        parent.connections.len(),
                        parent.connections
                    );
                }
                Err(e) => error!("[GrandSocketStation] Error: {:?}!", e),
            },
            None => error!(
                "[GrandSocketStation] None. Could not unwrap when attempting to access parent."
            ),
        }
    }

    fn serialize_and_send_posts(&self, data: &[Model], versions: &[u64]) -> Result<(), ws::Error> {
        let output = WSMessageResponse::new(data, versions);
        debug!("Sending: {:?}", output);

        let serialized =
            serde_json::to_string(&output).expect("Uh-oh... JSON serialization error!~");
        debug!("Serialized content: {}", serialized);
        self.tx.send(serialized)
    }

    fn handle_get_msg(&self, msg: WSMessage) -> Option<String> {
        debug!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Get);
        let mut return_message = Msg::new().set_msg_type(MessageType::Get).build();

        let mut p = Post::new();
        p.id = match msg.id {
            Some(id) => id,
            None => return Some(String::from("No Post ID provided.")),
        };

        return_message
            .items
            .push(Arc::new(Resource::new(Model::Post(p))));

        match self.to_cache.send(Arc::new(return_message)) {
            Ok(_) => {}
            Err(e) => {
                error!("[Error] ---> {:?}", e);
            }
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => val,
            Err(e) => {
                error!("[Error] ---> {:?}", e);
                let ret: String = format!("Error receiving from channel (from cache).");
                return Some(ret);
            }
        };

        let resp_data: Vec<Model> = resp.items.iter().map(|x| x.data.clone()).collect();
        let versions: Vec<u64> = resp.items.iter().map(|resource| resource.version).collect();

        match self.serialize_and_send_posts(&resp_data, &versions) {
            Ok(_) => None,
            Err(e) => Some(format!("Err: {:?}", e)),
        }
    }
    fn handle_create_msg(&self, msg: WSMessage) -> Option<String> {
        debug!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Create);
        let mut wrap = Msg::new().set_msg_type(MessageType::Create).build();

        let p = match msg.post {
            Some(post) => post,
            None => {
                // fail-fast
                return Some(String::from("No post was provided!"));
            }
        };

        wrap.items.push(Arc::new(Resource::new(Model::Post(p))));
        match self.to_cache.send(Arc::new(wrap)) {
            Ok(val) => {
                debug!("Sucessfully sent and got in return: {:?}", val);
            }
            Err(e) => {
                error!(
                    "There was an error communicating with the cache! Err: {:?}",
                    e
                );
                return Some(String::from(
                    "There was an error communicating with the cache.",
                ));
            }
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => val,
            Err(_) => {
                return Some(String::from("Error receiving from channel (from cache)."));
            }
        };

        let output: Vec<Model> = resp.items.iter().map(|x| x.data.clone()).collect();
        let versions: Vec<u64> = resp.items.iter().map(|resource| resource.version).collect();

        match self.serialize_and_send_posts(&output, &versions) {
            Ok(_) => None,
            Err(e) => Some(format!("Err: {:?}", e)),
        }
    }

    fn handle_manifest_msg(&self, msg: WSMessage) -> Option<String> {
        debug!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Manifest);

        let post_versions = match msg.manifest {
            Some(post_versions) => post_versions,
            None => return Some(String::from("No manifest was provided")),
        };
        if post_versions.is_empty() {
            let posts = vec![];
            let versions = vec![];
            match self.serialize_and_send_posts(&posts, &versions) {
                Ok(_) => {}
                Err(e) => error!("Websocket Error: {:?}", e),
            }
            None
        } else {
            debug!("manifest: {:?}", post_versions);
            let mut wrap = Msg::new().set_msg_type(MessageType::Manifest).build();
            for post_version in post_versions {
                debug!(
                    "[MAIN] manifest handler: adding post id {} version {} to cache list",
                    post_version.id, post_version.version
                );
                let mut p = Post::new();
                p.id = post_version.id;
                let mut resource = Resource::new(Model::Post(p));
                resource.version = post_version.version;
                wrap.items.push(Arc::new(resource));
            }
            match self.to_cache.send(Arc::new(wrap)) {
                Ok(val) => {
                    debug!("Sucessfully sent and got in return: {:?}", val);
                }
                Err(e) => {
                    error!(
                        "There was an error communicating with the cache! Err: {:?}",
                        e
                    );
                    return Some(String::from(
                        "There was an error communicating with the cache.",
                    ));
                }
            };

            let resp = match self.from_cache.recv() {
                Ok(val) => val,
                Err(_) => {
                    return Some(String::from("Error receiving from channel (from cache)."));
                }
            };
            let output: Vec<Model> = resp.items
                .iter()
                .map(|post| match &post.data {
                    Model::Post(p) => Some(p),
                    _ => None,
                })
                .filter(|post| post.is_some())
                .map(|post| Model::Post(post.unwrap().clone()))
                .collect();

            let versions: Vec<u64> = resp.items.iter().map(|resource| resource.version).collect();
            match self.serialize_and_send_posts(&output, &versions) {
                Err(e) => Some(format!("Error: {:?}", e)),
                _ => None,
            }
        }
    }
    fn handle_update_msg(&mut self, msg: WSMessage) -> Option<String> {
        debug!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Update);
        let mut wrap = Msg::new().set_msg_type(MessageType::Update).build();

        // does the request have a Post ID?
        let post = match msg.post {
            Some(post) => post,
            None => {
                // fail-fast
                return Some(String::from("No post ID was provided!"));
            }
        };
        {
            wrap.items.push(Arc::new(Resource::new(Model::Post(post))));
        }

        match self.to_cache.send(Arc::new(wrap)) {
            Ok(val) => {
                debug!("Sucessfully sent and got in return: {:?}", val);
            }
            Err(e) => {
                error!(
                    "There was an error communicating with the cache! Err: {:?}",
                    e
                );
            }
        };
        let changes = match self.from_cache.recv() {
            Ok(val) => Ok(val),
            Err(_) => Err(String::from("Error receiving from channel (from cache).")),
        };

        // @TODO: This is the actual update sending code. Could be optimized greatly.
        if let Ok(updated_data) = changes {
            debug!("Updated_data ---------------> {:?}", updated_data.items);
            let mut watchers: Vec<Vec<i32>> = vec![];
            let (posts, versions): (Vec<Model>, Vec<u64>) = updated_data
                .items
                .iter()
                .map(|resource| {
                    watchers.push(resource.watchers.clone()); // @TODO: figure out a way around this clone
                    (resource.data.clone(), resource.version) // @TODO: figure out a way around this clone
                })
                .unzip();

            // @TODO: This could be simplified somewhat or abstracted into functions/parts
            match &mut self.parent {
                Some(val) => match val.try_borrow_mut() {
                    Ok(parent) => {
                        info!("TOTAL CONNECTIONS: {:?}", &parent.connections);
                        for c in &parent.connections {
                            // @TODO: Simplify/abstract this section into separate function(s)
                            debug!("Connection --> {:?}", c);
                            let id = c.tx.connection_id();
                            let all_watchers =
                                watchers.iter().flat_map(|y| y).find(|x| **x == id as i32);

                            debug!("WATCHES ---> {:?}, LOOKING FOR ----> {:?}, MATCHED_WATCHES ---> {:?}", watchers, id, all_watchers);
                            if let Some(matched_connection) =
                                watchers.iter().flat_map(|y| y).find(|x| **x == id as i32)
                            {
                                let ws_response = WSMessageResponse::new(&posts, &versions);
                                let serialized = serde_json::to_string(&ws_response)
                                    .expect("Uh-oh... JSON serialization error!~");
                                let send_result = c.tx.send(serialized);
                                if send_result.is_err() {
                                    return Some(format!("Error: {:?}", send_result.unwrap_err()));
                                }
                            } else {
                                debug!("There was no matched connection for: {}. It does not need to be updated.", id);
                            }
                        }
                    }
                    Err(e) => error!("Error: {:?}!", e),
                },
                None => warn!("None. Did not unwrap."),
            }
        }
        None
    }
    fn handle_watch_msg(&self, msg: WSMessage) -> Option<String> {
        debug!("[MAIN] received: {:?}", msg.message);
        assert_eq!(msg.message, MessageType::Watch);
        let mut wrap = Msg::new().set_msg_type(MessageType::Watch).build();

        // does the request have a Post ID?
        let post_id = match msg.id {
            Some(post_id) => post_id,
            None => {
                // fail-fast
                return Some(String::from("No post ID was provided!"));
            }
        };
        let mut post = Post::new();
        post.id = post_id;
        let mut resource = Resource::new(Model::Post(post));

        let token = self.tx.token();
        let conn_id = self.tx.connection_id();

        // add watch to resource
        resource.add_watch(conn_id as i32);
        wrap.connection_id = conn_id as i32;

        // wrap it up and send
        wrap.items.push(Arc::new(resource));
        match self.to_cache.send(Arc::new(wrap)) {
            Ok(val) => {
                debug!("Sucessfully sent and got in return: {:?}", val);
            }
            Err(e) => {
                error!(
                    "There was an error communicating with the cache! Err: {:?}",
                    e
                );
                return Some(String::from(
                    "There was an error communicating with the cache.",
                ));
            }
        };

        let resp = match self.from_cache.recv() {
            Ok(val) => val,
            Err(_) => {
                return Some(String::from("Error receiving from channel (from cache)."));
            }
        };

        let output = vec![];
        let versions = vec![];
        match self.serialize_and_send_posts(&output, &versions) {
            Ok(o) => None,
            Err(e) => Some(format!("Err: {:?}", e)),
        }
    }
}

fn main() {
    pretty_env_logger::init();
    info!("starting cache service...");

    let db = DB::new();
    let session = db.get();

    let hub = Rc::new(RefCell::new(GrandSocketStation::new(&session)));
    let i = &mut 0;

    // start db (SAVE only) thread
    let (send_db, recv_db) = crossbeam_channel::unbounded();
    let db_handle = thread::spawn(move || {
        save_posts(recv_db);
    });

    // start cache + return necessary comm. channels
    let (a, b, c): (
        crossbeam_channel::Sender<Arc<Msg>>,
        crossbeam_channel::Receiver<Arc<Msg>>,
        crossbeam_channel::Sender<Cancel>,
    ) = wire_up(send_db);

    listen("0.0.0.0:3012", move |out| {
        let mut value = None;
        {
            value = Some(Connection {
                id: *i,
                tx: out.clone(),
                user: None,
                parent: Some(hub.clone()),
                to_cache: a.clone(),
                from_cache: b.clone(),
                kill_cache: c.clone(),
            });
        }
        let conn: Connection = value.unwrap();

        let h = &mut hub.borrow_mut();
        h.push_connection(conn.clone());
        let value: Option<Connection> = Some(conn.clone());
        *i += 1;
        value.unwrap()
    }).unwrap();

    // await db thread to end...
    match db_handle.join() {
        Ok(_) => {}
        Err(e) => error!("Error in db_handle.join() --> {:?}", e),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use models::*;

    #[test]
    fn test_connection_add_user() {
        // Builder::new().with_settings(Settings::default()).build();
        // let (send_db, recv_db) = crossbeam_channel::unbounded();
        // let (a, b, c) = wire_up(send_db);
        // let c = Connection {
        //         id: 1,
        //         tx: Sender::new(Token::new(), SyncSender::<Command>::new(), 1),
        //         user: None,
        //         parent: Some(hub.clone()),
        //         to_cache: a.clone(),
        //         from_cache: b.clone(),
        //         kill_cache: c.clone(),
        // };

    }

    // #[test]
    // fn test_raises_no_id_provided() {
    //     fn inner(yes: bool) -> Result<(), NoIDProvided> {
    //         if yes {
    //             Err(NoIDProvided::new("this is the error msg."))
    //         } else {
    //             Ok(())
    //         }
    //     }
    // }

}
