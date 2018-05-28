
# Header 1


| header! | Header 2    |
|---------|------------:|
| entry 1 | entry 2     |
| row 2   | row 2 col 2 |

~~~~
let changes = match self.from_cache.recv() {
    Ok(val) => Ok(val.items().clone()),
    Err(e) => Err(String::from("Error receiving from channel (from cache).")),
};
~~~~
