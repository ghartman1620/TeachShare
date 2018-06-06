use crossbeam_channel;
use std::sync::{Arc, Mutex};
use std::thread;

pub enum Message {
    NewJob(Job),
    Terminate,
}

#[derive(Debug)]
pub struct ThreadPool {
    pub workers: Vec<Worker>,
    pub sender: crossbeam_channel::Sender<Message>,
}

#[derive(Debug)]
pub struct Worker {
    pub id: usize,
    pub thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<crossbeam_channel::Receiver<Message>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let msg = receiver
                .lock()
                .expect("Could not acquire lock.")
                .recv()
                .expect("Failed to recieve message.");

            // info!("Worker {} got a job; executing.", id);

            match msg {
                Message::NewJob(job) => {
                    info!("Worker {} got a job; executing", id);
                    job.call_box();
                }
                Message::Terminate => {
                    info!("Worker {} was told to terminate,", id);
                    break;
                }
            }
        });
        Worker {
            id,
            thread: Some(thread),
        }
    }
}

pub trait FnBox {
    fn call_box(self: Box<Self>);
}

impl<F: FnOnce()> FnBox for F {
    fn call_box(self: Box<F>) {
        (*self)()
    }
}

pub type Job = Box<FnBox + Send + 'static>;

#[derive(Debug)]
pub struct PoolCreationError;

impl ThreadPool {
    pub fn new(size: usize) -> Result<ThreadPool, PoolCreationError> {
        // not sure if this will return a Result on failure or whatever..?
        assert!(size > 0);
        let (sender, receiver) = crossbeam_channel::unbounded();
        // let snd: mpsc::Sender<Message> = sender.clone();
        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);
        for i in 0..size {
            workers.push(Worker::new(i, Arc::clone(&receiver)));
        }
        Ok(ThreadPool { workers, sender })
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        debug!("Starting to execute task...");
        self.sender
            .send(Message::NewJob(job))
            .expect("Failed to send new job.");
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        for _ in &mut self.workers {
            self.sender
                .send(Message::Terminate)
                .expect("Failed to send termination message.");
        }
        for worker in &mut self.workers {
            info!("Shutting down worker {}", worker.id);
            if let Some(thread) = worker.thread.take() {
                match thread.join() {
                    Ok(joined) => joined,
                    Err(e) => panic!("Failed to join thread {}. Err: {:?}", worker.id, e),
                };
            }
        }
    }
}
