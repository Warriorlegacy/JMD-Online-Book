# SKILL: Rust Orderbook Logic

## Core Principles
1. **No Floating Point**: All prices and stakes must be handled as `u64`.
2. **Mechanical Sympathy**: Use cache-line padding for the RingBuffer.

## Formulas
- **Back Stake**: User risks `stake`.
- **Lay Liability**: User risks `(Stake * DecimalOdds) - Stake`.
- **Match Priority**: Price-Time priority. 
  - For Backs: Highest price first.
  - For Lays: Lowest price first.
  - Same price: Earliest timestamp first.

## Struct Requirements
```rust
#[derive(Debug, Clone)]
pub struct Order {
    pub id: u64,
    pub user_id: u64,
    pub price: u64, // e.g. 250 for 2.50 decimal odds
    pub stake: u64,
    pub timestamp: i64,
}
```
