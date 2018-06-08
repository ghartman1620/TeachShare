/*!
 The websocket cache service is used for realtime communication between connected users.
*/
#![feature(vec_remove_item, slice_patterns, extern_prelude)]
#![warn(clippy)]

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
use ws::{
    listen, CloseCode, Error, Handler, Handshake, Message, Request, Response, Result as WSResult,
    Sender, Factory,
};

mod cache;
mod db;
mod models;
mod pool;
mod schema;
mod users;

use cache::*;
use models::*;

use chrono::{DateTime, Duration, Local, NaiveTime, Utc};
use crossbeam_channel::{Receiver, Sender as CrossBSender};
use db::DB;
use diesel::pg::PgConnection;
use log::Level;
use models::MessageType;
use pool::ThreadPool;
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::error::Error as StdError;
use std::rc::Rc;
use std::sync::Arc;
use std::thread;
use std::time::SystemTime;
use users::{Oauth2ProviderAccesstoken, User};

const DB_POOL_SIZE: usize = 4;

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
    pub fn duration_valid(t: chrono::DateTime<Utc>) -> Option<Duration> {
        let difference = t - Utc::now();
        println!("The difference is: {:?}", difference);
        let hours = difference.num_hours();
        let difference = difference - Duration::hours(hours);
        let min = difference.num_minutes();
        println!(
            "Hours: {:?}, Difference: {:?}, Minutes: {:?}",
            hours, difference, min
        );

        if difference < Duration::hours(0) {
            return None;
        }
        Some(difference)
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
    db: DB,
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
            "ConnectionID: {}, sender: {} -> User: {:?}",
            self.id,
            self.tx.connection_id(),
            self.user
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

trait CookieExtractor {
    type ResultType;
    fn get_key(&self, key: &str) -> Option<Self::ResultType>;
}

struct CookieStr<'a>(&'a Vec<u8>);

impl<'a> CookieExtractor for CookieStr<'a> {
    type ResultType = String;
    fn get_key(&self, key: &str) -> Option<Self::ResultType> {
        let cookie_str: Result<Vec<Vec<String>>, _> = String::from_utf8(self.0.as_slice().to_vec())
            .map(|x| {
                x.split(';')
                    .map(|y| {
                        y.trim()
                            .to_owned()
                            .split('=')
                            .map(|a| a.to_owned())
                            .collect::<Vec<String>>()
                    })
                    .filter(|c| match c.as_slice() {
                        [k, _, _..] if key == &**k => true,
                        _ => false,
                    })
                    .collect()
            });

        if cookie_str.is_ok() {
            let res = cookie_str.unwrap();

            // The silly-ness below is actually just very careful bounds checking. Better
            // safe than 'IndexOutOfBounds'..
            if !res.is_empty() {
                if res[0].len() > 1 {
                    Some(res[0][1].clone())
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        }
    }
}

pub enum WSAuthError {
    BadToken,
}

impl Handler for Connection {
    fn on_request(&mut self, req: &Request) -> WSResult<Response> {
        info!(
            "Websocket request recieved for [resource]: {:?} from [addr]: {:?} --> [origin]: {:?}",
            req.resource(),
            req.client_addr(),
            req.origin()
        );
        let cookie = req.header("Cookie");
        if cookie.is_some() {
            let empty = "".to_owned().into_bytes();
            let cookie_str = CookieStr(cookie.unwrap_or(&empty));
            match cookie_str.get_key("token") {
                Some(token) => {
                    debug!("Token: {:?}", token);
                    // check token

                    let res = Response::from_request(req)?;
                    Ok(res)
                }
                None => {
                    error!("No token found, revoke access!");
                    Err(ws::Error::new(
                        ws::ErrorKind::Custom(Box::new(GSSError::BadToken("Testing string..."))),
                        "The client could not be authenticated properly..",
                    ))
                }
            }
        } else {
            Err(ws::Error::new(
                ws::ErrorKind::Custom(Box::new(GSSError::BadToken("Testing string #2..."))),
                "The client could not be authenticated properly..",
            ))
        }
        //
    }

    // @TODO: @FIXME: This needs to probably go in the 'on_request' method, where we deny them
    // BEFORE connection, as apose to this, where it is already technically too late. I need to
    // deny the connection earlier. The logic will be roughly the same though, 1-1.
    fn on_open(&mut self, hs: Handshake) -> ws::Result<()> {
        info!("client connected.");
        for (key, value) in hs.request.headers() {
            info!("{:?}: {:?}", key, String::from_utf8(value.clone()));
        }

        // find the user...
        let mut user_id = -1;
        {
            // funky scope is due to the need for a mutable and immutable borrow on 'self'
            // which requires one of the borrows to return the value before the next can continue..
            let token = hs.request.header("Cookie");
            let oauth_id = token.and_then(|tok| {
                let cookies = CookieStr(tok);
                let mut token = String::new();
                if let Some(token_str) = cookies.get_key("token") {
                    token = token_str;
                }
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
                info!("got parent! {:?}", out);
                match out {
                    Ok(p) => {
                        let table: &BTreeMap<
                            String,
                            Oauth2ProviderAccesstoken,
                        > = &p.auth_table;
                        debug!("Table: {:?}", table);
                        if table.contains_key(&token) {
                            let oauth2 = p.auth_table[&token].clone();
                            info!("Found User OAUTH2 entry: {:?}", oauth2);
                            return Some(oauth2);
                        } else {
                            warn!("Oath2 Entry does not exist for token. Could be expired.");
                            return None;
                        }
                    }
                    Err(e) => warn!("Could not unwrap Parent (GrandSocketStation"),
                }

                // Oauth2ProviderAccesstoken::get_by_token(tok, )
                // self.set_user(u);
                None
            });
            user_id = oauth_id.and_then(|v| v.user_id).unwrap_or(-1);
        }

        // let db = self.db.get();
        if user_id != -1 {
            let u = User::get_by_id(user_id, &self.db);
            if u.is_ok() {
                let user = u.unwrap();
                info!("Got user: {:?}", user);
                self.set_user(user);
                info!("CONNECTION: {:?}", self);
                Ok(())
            } else {
                Err(ws::Error::new(
                        ws::ErrorKind::Custom(Box::new(GSSError::FailedUserAuth("No user was found for that id."))),
                        "The client could not be authenticated properly..",
                    ))
            }
        } else {
            Err(ws::Error::new(
                ws::ErrorKind::Custom(Box::new(GSSError::FailedUserAuth("Could not find Oauth2 reference in db for token."))),
                "The client could not be authenticated properly..",
            ))
        }
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
                        MessageType::Get => self.handle_get_msg(&msg),
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
pub enum GSSError<'tokstr, 'authstr> {
    GetParent,
    Unknown,
    BadToken(&'tokstr str),
    FailedUserAuth(&'authstr str),
}

impl<'tokstr, 'authstr> fmt::Display for GSSError<'tokstr, 'authstr> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            GSSError::GetParent => f.write_str("Get parent error."),
            GSSError::Unknown => f.write_str("Unknown GSS error."),
            GSSError::BadToken(msg) => {
                let temp = format!("Bad token. Msg: [{}]", msg);
                f.write_str(&*temp)
            },
            GSSError::FailedUserAuth(msg) => {
                let temp = format!("Could not authenticate user. Msg: [{}]", msg);
                f.write_str(&*temp)
            }
        }
    }
}

impl<'tokstr, 'authstr> StdError for GSSError<'tokstr, 'authstr> {
    fn description(&self) -> &str {
        match *self {
            GSSError::GetParent => "Could not mutably borrow parent.",
            GSSError::Unknown => "Unknown error handling GrandSocketStation instance.",
            GSSError::BadToken(msg) => msg,
            GSSError::FailedUserAuth(msg) => msg,
        }
    }
}

impl<'tokstr, 'authstr> From<std::cell::BorrowMutError> for GSSError<'tokstr, 'authstr> {
    fn from(e: std::cell::BorrowMutError) -> Self {
        GSSError::GetParent
    }
}

impl Connection {
    fn set_user(&mut self, u: User) {
        self.user = Some(u);
    }
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
    fn handle_get_msg(&self, msg: &WSMessage) -> Option<String> {
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
                let ret: String = "Error receiving from channel (from cache).".to_string();
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
                            if watchers.iter().flat_map(|y| y).any(|x| *x == id as i32) {
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

        match self.from_cache.recv() {
            Ok(val) => val,
            Err(_) => {
                return Some(String::from("Error receiving from channel (from cache)."));
            }
        };

        let output = vec![];
        let versions = vec![];
        match self.serialize_and_send_posts(&output, &versions) {
            Ok(_) => None,
            Err(e) => Some(format!("Err: {:?}", e)),
        }
    }
}

fn start_db_pool() -> (
    crossbeam_channel::Sender<models::Post>,
    crossbeam_channel::Sender<cache::Cancel>,
) {
    let (kill_db_send, kill_db_recv): (CrossBSender<Cancel>, Receiver<Cancel>) =
        crossbeam_channel::unbounded();
    let (send_db, recv_db): (CrossBSender<Post>, Receiver<Post>) = crossbeam_channel::unbounded();

    match ThreadPool::new(DB_POOL_SIZE) {
        Ok(pool) => {
            info!("starting a pool of threads for teh DB saves...");

            thread::spawn(move || {
                for i in 0..DB_POOL_SIZE {
                    info!("Starting thread: {}.", i);
                    let closure_owned_recv = recv_db.clone();
                    let closure_owned_cancel = kill_db_recv.clone();

                    pool.execute(move || {
                        let db = DB::new(); // only make a DB once
                        let conn = db.get(); // grab reference
                        loop {
                            select_loop! {
                                recv(closure_owned_recv, p) => {
                                    let res = p.save(&*conn);
                                    debug!("attempting to save post... {:?}", res);
                                    match res {
                                        Ok(_) => info!("Saving post in DB response was successful!"),
                                        Err(e) => error!("[DB]<ERROR> Saving post error. '{:?}'", e),
                                    }
                                },
                                recv(closure_owned_cancel, cancel) => {
                                    warn!("Closing one of the DB threads...");
                                    return;
                                }
                            }
                        }
                    });
                }
            });
        }
        Err(e) => error!(
            "There was an error creating the Database Threadpool. {:?}",
            e
        ),
    }
    (send_db, kill_db_send)
}

// struct WServeFactory;

// impl Factory for WServeFactory {
//     type Handler = Connection;

//     fn connection_made(&mut self, ws: Sender) -> Connection {
//         Connection {
//             ws: ws,

//             is_client: true,
//             db: DB::new(),
//             id: *i,
//             tx: out.clone(),
//             user: None,
//             parent: Some(hub.clone()),
//             to_cache: a.clone(),
//             from_cache: b.clone(),
//             kill_cache: c.clone(),
//         }
//     }
// }


fn main() {
    pretty_env_logger::init();
    info!("starting cache service...");

    let db = DB::new();
    let session = db.get();

    let hub = Rc::new(RefCell::new(GrandSocketStation::new(&session)));
    let i = &mut 0;

    // setup database send threadpool. Should allow for pretty high load if necessary...
    let (send_db, kill_db_send) = start_db_pool();

    // start cache + return necessary comm. channels
    let (a, b, c): (
        crossbeam_channel::Sender<Arc<Msg>>,
        crossbeam_channel::Receiver<Arc<Msg>>,
        crossbeam_channel::Sender<Cancel>,
    ) = wire_up(send_db);

    let mut settings = ws::Settings::default();
    settings.panic_on_internal = false;

    // let socket_serv = ws::Builder::new().with_settings(settings);
    
    // socket_serv.build(factory);

    listen("0.0.0.0:3012", move |out| {
        let mut value = None;
        {
            value = Some(Connection {
                db: DB::new(),
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

    match kill_db_send.send(Cancel {
        msg: "Closing...".to_owned(),
    }) {
        Ok(_) => {}
        Err(err) => error!("There was an error closing the db threadpool. {:?}", err),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use models::*;

    #[test]
    fn test_cookie_str() {
        let st = " test=Teststring;  a=v; ".to_owned().as_bytes().to_vec();
        let test = CookieStr(&st);
        let a = test.get_key("test");
        let b = test.get_key("a");
        let c = test.get_key("b");
    }
}
