#![feature(box_raw)]

use std::ptr::{self, null_mut};
use std::sync::atomic::AtomicPtr;
use std::sync::atomic::Ordering;

pub struct Atomic<T> {}

pub struct Stack<T> {
    head: AtomicPtr<Node<T>>,
}

pub struct Node<T> {
    data: T,
    next: *mut Node<T>,
}

impl<T> Stack<T> {
    pub fn new() -> Stack<T> {
        Stack {
            head: AtomicPtr::new(null_mut()),
        }
    }

    pub fn pop(&self) -> Option<T> {
        loop {
            let head = self.head.load(Ordering::Acquire);

            if head == null_mut() {
                return None
            } else {
                let next = unsafe { (*head).next };

                if self.head.compare_and_swap(head, next, Ordering::Release) == head {
                    return Some(unsafe { ptr::read(&(*head).data) });
                }
            }
        }
    }

    pub fn push(&self, t: T) {
        let n = Box::into_raw(Box::new(Node {
            data: t,
            next: null_mut(),
        }));
        loop {
            let head = self.head.load(Ordering::Relaxed);

            unsafe { (*n).next = head; }

            if self.head.compare_and_swap(head, n, Ordering::Release) == head {
                break
            }
        }
    }
}


