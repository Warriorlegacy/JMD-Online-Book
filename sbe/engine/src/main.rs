use engine::MatchingEngine;
use engine::models::{Order, Side, OrderType};
use std::io::{BufRead, Write};
use uuid::Uuid;
use rust_decimal::Decimal;
use std::str::FromStr;

fn main() -> std::io::Result<()> {
    println!("SBE Matching Engine started on stdout/stdin bridge...");
    
    let engine = MatchingEngine::new_isolated();
    let stdin = std::io::stdin();
    let mut stdout = std::io::stdout();

    for line in stdin.lock().lines() {
        let input = line?;
        if input.trim().is_empty() { continue; }

        // Protocol: match_id|selection_id|user_id|side|price|stake
        let parts: Vec<&str> = input.split('|').collect();
        if parts.len() < 6 {
            eprintln!("Invalid command: {}", input);
            continue;
        }

        let match_id = Uuid::from_str(parts[0]).unwrap_or_default();
        let selection_id = parts[1].to_string();
        let user_id = Uuid::from_str(parts[2]).unwrap_or_default();
        let side = if parts[3] == "back" { Side::Back } else { Side::Lay };
        let price = Decimal::from_str(parts[4]).unwrap_or_default();
        let stake = Decimal::from_str(parts[5]).unwrap_or_default();

        let order = Order::new(
            user_id,
            match_id,
            selection_id.clone(),
            side,
            OrderType::Limit,
            price,
            stake,
        );

        let trades = engine.process_order(order);
        
        // Also get snapshot for the matched selection
        let snapshot = if let Some(book) = engine.books.get(&(match_id, selection_id)) {
            book.snapshot()
        } else {
            serde_json::json!({})
        };

        let result = serde_json::json!({
            "trades": trades,
            "snapshot": snapshot
        });

        let output = serde_json::to_string(&result).unwrap_or_else(|_| "{}".to_string());
        
        writeln!(stdout, "{}", output)?;
        stdout.flush()?;
    }

    Ok(())
}
