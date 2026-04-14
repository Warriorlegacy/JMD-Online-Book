# SBE Mission & Business Logic

## High-Level Goal
Construct a high-performance, neutral marketplace for sports betting where users bet against each other (Peer-to-Peer) rather than against a house.

## Financial Model
1. **Back Betting**: User predicts an outcome will occur. 
   - *Risk*: Stake.
   - *Potential Profit*: (Stake * Odds) - Stake.
2. **Lay Betting**: User acts as the bookmaker, predicting an outcome will *not* occur.
   - *Risk (Liability)*: (Stake * Decimal Odds) - Stake.
   - *Potential Profit*: Stake.
3. **Monetization**: The exchange platform charges a **2-5% commission** only on net winnings.
4. **Escrow**: Both the Backer's stake and the Layer's liability are locked in escrow upon match execution.

## System Performance Requirements
- **Latency**: Sub-microsecond matching.
- **Concurrency**: Millions of updates during live "In-Play" events.
- **Determinism**: No rounding errors or inconsistent price-time matching.

## Target Markets
- Initial focus on Football (Soccer), Tennis, and Cricket markets.
- Support for "In-Play" betting with rapid odds fluctuations.
