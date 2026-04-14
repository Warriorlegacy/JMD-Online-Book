use crate::book::OrderBook;
use crate::models::{Order, Trade};
use dashmap::DashMap;
use uuid::Uuid;
use crossbeam::channel::{Receiver, Sender, unbounded};
use std::sync::Arc;

pub enum EngineCommand {
    NewOrder(Order),
    CancelOrder(Uuid, Uuid), // match_id, order_id
}

pub struct MatchingEngine {
    pub books: Arc<DashMap<Uuid, OrderBook>>,
    command_rx: Receiver<EngineCommand>,
    trade_tx: Sender<Vec<Trade>>,
}

impl MatchingEngine {
    pub fn new_isolated() -> Self {
        let (_tx1, rx) = unbounded();
        let (tx2, _rx2) = unbounded();
        Self {
            books: Arc::new(DashMap::new()),
            command_rx: rx,
            trade_tx: tx2,
        }
    }

    pub fn process_order(&self, order: Order) -> Vec<Trade> {
        let match_id = order.match_id;
        let mut book_entry = self.books.entry(match_id).or_insert_with(|| OrderBook::new(match_id));
        book_entry.add_order(order)
    }
}
