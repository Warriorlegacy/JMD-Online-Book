use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum Side {
    Back,
    Lay,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum OrderType {
    Limit,
    Market,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Order {
    pub id: Uuid,
    pub user_id: Uuid,
    pub match_id: Uuid,
    pub side: Side,
    pub order_type: OrderType,
    pub price: Decimal,
    pub stake: Decimal,
    pub remaining_stake: Decimal,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trade {
    pub match_id: Uuid,
    pub backer_id: Uuid,
    pub layer_id: Uuid,
    pub price: Decimal,
    pub size: Decimal,
    pub backer_order_id: Uuid,
    pub layer_order_id: Uuid,
    pub timestamp: DateTime<Utc>,
}

impl Order {
    pub fn new(
        user_id: Uuid,
        match_id: Uuid,
        side: Side,
        order_type: OrderType,
        price: Decimal,
        stake: Decimal,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            user_id,
            match_id,
            side,
            order_type,
            price,
            stake,
            remaining_stake: stake,
            timestamp: Utc::now(),
        }
    }

    pub fn is_filled(&self) -> bool {
        self.remaining_stake.is_zero()
    }

    pub fn calculate_liability(&self) -> Decimal {
        if self.side == Side::Lay {
            (self.stake * self.price) - self.stake
        } else {
            self.stake
        }
    }
}
