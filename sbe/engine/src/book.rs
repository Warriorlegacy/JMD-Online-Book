use crate::models::{Order, Trade, Side};
use std::collections::{BTreeMap, VecDeque};
use rust_decimal::Decimal;
use uuid::Uuid;
use chrono::Utc;

pub struct OrderBook {
    pub match_id: Uuid,
    pub selection_id: String,
    pub backs: BTreeMap<Decimal, VecDeque<Order>>, // Price -> Orders (Sorted Desc)
    pub lays: BTreeMap<Decimal, VecDeque<Order>>,  // Price -> Orders (Sorted Asc)
}

impl OrderBook {
    pub fn new(match_id: Uuid, selection_id: String) -> Self {
        Self {
            match_id,
            selection_id,
            backs: BTreeMap::new(),
            lays: BTreeMap::new(),
        }
    }

    pub fn snapshot(&self) -> serde_json::Value {
        serde_json::json!({
            "backs": self.backs.iter().rev().take(10).map(|(p, o)| {
                (p.to_string(), o.iter().map(|o| o.remaining_stake).sum::<Decimal>().to_string())
            }).collect::<Vec<_>>(),
            "lays": self.lays.iter().take(10).map(|(p, o)| {
                (p.to_string(), o.iter().map(|o| o.remaining_stake).sum::<Decimal>().to_string())
            }).collect::<Vec<_>>(),
        })
    }

    pub fn add_order(&mut self, mut order: Order) -> Vec<Trade> {
        let mut trades = Vec::new();

        match order.side {
            Side::Back => {
                // Match against existing Lays
                while order.remaining_stake > Decimal::ZERO {
                    // Find the best lay (lowest price)
                    let best_lay_price = self.lays.keys().next().cloned();
                    
                    if let Some(price) = best_lay_price {
                        if price <= order.price {
                            let orders_at_price = self.lays.get_mut(&price).unwrap();
                            
                            while !orders_at_price.is_empty() && order.remaining_stake > Decimal::ZERO {
                                let mut lay_order = orders_at_price.pop_front().unwrap();
                                let match_size = order.remaining_stake.min(lay_order.remaining_stake);
                                
                                trades.push(Trade {
                                    match_id: self.match_id,
                                    selection_id: self.selection_id.clone(),
                                    backer_id: order.user_id,
                                    layer_id: lay_order.user_id,
                                    price,
                                    size: match_size,
                                    backer_order_id: order.id,
                                    layer_order_id: lay_order.id,
                                    timestamp: Utc::now(),
                                });

                                order.remaining_stake -= match_size;
                                lay_order.remaining_stake -= match_size;

                                if !lay_order.is_filled() {
                                    orders_at_price.push_front(lay_order);
                                }
                            }

                            if orders_at_price.is_empty() {
                                self.lays.remove(&price);
                            }
                        } else {
                            break; // No match possible
                        }
                    } else {
                        break; // No lays available
                    }
                }

                if !order.is_filled() {
                    self.backs
                        .entry(order.price)
                        .or_insert_with(VecDeque::new)
                        .push_back(order);
                }
            }
            Side::Lay => {
                // Match against existing Backs
                while order.remaining_stake > Decimal::ZERO {
                    // Find the best back (highest price)
                    let best_back_price = self.backs.keys().next_back().cloned();
                    
                    if let Some(price) = best_back_price {
                        if price >= order.price {
                            let orders_at_price = self.backs.get_mut(&price).unwrap();
                            
                            while !orders_at_price.is_empty() && order.remaining_stake > Decimal::ZERO {
                                let mut back_order = orders_at_price.pop_front().unwrap();
                                let match_size = order.remaining_stake.min(back_order.remaining_stake);
                                
                                trades.push(Trade {
                                    match_id: self.match_id,
                                    selection_id: self.selection_id.clone(),
                                    backer_id: back_order.user_id,
                                    layer_id: order.user_id,
                                    price,
                                    size: match_size,
                                    backer_order_id: back_order.id,
                                    layer_order_id: order.id,
                                    timestamp: Utc::now(),
                                });

                                order.remaining_stake -= match_size;
                                back_order.remaining_stake -= match_size;

                                if !back_order.is_filled() {
                                    orders_at_price.push_front(back_order);
                                }
                            }

                            if orders_at_price.is_empty() {
                                self.backs.remove(&price);
                            }
                        } else {
                            break; // No match possible
                        }
                    } else {
                        break; // No backs available
                    }
                }

                if !order.is_filled() {
                    self.lays
                        .entry(order.price)
                        .or_insert_with(VecDeque::new)
                        .push_back(order);
                }
            }
        }

        trades
    }
}
