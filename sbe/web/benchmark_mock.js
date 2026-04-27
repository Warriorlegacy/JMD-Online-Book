const { performance } = require('perf_hooks');

// Realistic timing simulation (database calls usually take 1-5ms each)
const DB_CALL_MS = 2;

async function mockDbCall() {
  return new Promise(resolve => setTimeout(resolve, DB_CALL_MS));
}

// Generate large dataset
const NUM_USERS = 1000;
const NUM_TRADES = 5000;

console.log(`Setting up benchmark for ${NUM_TRADES} trades...`);

async function runBenchmark(useBatching) {
  // Reset state
  const trades = [];
  const wallets = new Map();
  const ledgerEntries = [];

  for (let i = 0; i < NUM_USERS; i++) {
    wallets.set(`user_${i}`, { balance: 1000, lockedBalance: 500, id: `wallet_${i}` });
  }

  for (let i = 0; i < NUM_TRADES; i++) {
    trades.push({
      id: `trade_${i}`,
      matchID: 'match_1',
      backerId: `user_${i % NUM_USERS}`,
      layerId: `user_${(i + 1) % NUM_USERS}`,
      stake: '10.00',
      price: '2.00',
      selectionId: i % 2 === 0 ? 'team_a' : 'team_b',
      settled: 0
    });
  }

  const unsettledTrades = trades.filter(t => t.matchID === 'match_1' && t.settled === 0);
  const affectedUsers = new Set();
  const matchId = 'match_1';
  const winningResult = 'team_a';
  const currency = 'INR';

  const start = performance.now();

  if (!useBatching) {
    // Current N+1 Implementation
    for (const trade of unsettledTrades) {
      // simulate transaction start
      await mockDbCall();

      const backerId = trade.backerId;
      const layerId = trade.layerId;
      const stake = parseFloat(trade.stake);
      const price = parseFloat(trade.price);
      const profit = stake * (price - 1);
      const commissionRate = 0.02;

      const backerWins = trade.selectionId === winningResult;
      affectedUsers.add(backerId);
      affectedUsers.add(layerId);

      if (backerWins) {
        // Backer Update
        await mockDbCall();

        // Layer Update
        await mockDbCall();

        // Ledger Insert (includes a select for wallet id in current implementation)
        await mockDbCall(); // select
        await mockDbCall(); // insert
      } else {
        // Layer Update
        await mockDbCall();

        // Backer Update
        await mockDbCall();

        // Ledger Insert
        await mockDbCall(); // select
        await mockDbCall(); // insert
      }

      // Trade update
      await mockDbCall();

      // simulate transaction end
    }
    // Match update
    await mockDbCall();
  } else {
    // Optimized Batched Implementation
    const walletUpdates = new Map();
    const newLedgerEntries = [];
    const tradeIds = [];

    // Memory-only calculation phase (fast)
    for (const trade of unsettledTrades) {
      const backerId = trade.backerId;
      const layerId = trade.layerId;
      const stake = parseFloat(trade.stake);
      const price = parseFloat(trade.price);
      const profit = stake * (price - 1);
      const commissionRate = 0.02;

      const backerWins = trade.selectionId === winningResult;

      affectedUsers.add(backerId);
      affectedUsers.add(layerId);

      if (!walletUpdates.has(backerId)) walletUpdates.set(backerId, { balanceDelta: 0, lockedBalanceDelta: 0 });
      if (!walletUpdates.has(layerId)) walletUpdates.set(layerId, { balanceDelta: 0, lockedBalanceDelta: 0 });

      const backerUpdate = walletUpdates.get(backerId);
      const layerUpdate = walletUpdates.get(layerId);

      if (backerWins) {
        const commission = profit * commissionRate;
        const netProfit = profit - commission;
        const totalPayout = stake + netProfit;

        backerUpdate.balanceDelta += totalPayout;
        backerUpdate.lockedBalanceDelta -= stake;

        layerUpdate.lockedBalanceDelta -= profit;

        newLedgerEntries.push({
          userId: backerId, // Need to map to walletId later
          amount: totalPayout,
          type: 'settlement_win',
          referenceId: trade.id
        });
      } else {
        const totalPayout = stake + profit;

        layerUpdate.balanceDelta += totalPayout;
        layerUpdate.lockedBalanceDelta -= profit;

        backerUpdate.lockedBalanceDelta -= stake;

        newLedgerEntries.push({
          userId: layerId,
          amount: totalPayout,
          type: 'settlement_lay_win',
          referenceId: trade.id
        });
      }
      tradeIds.push(trade.id);
    }

    // Single transaction for all updates
    await mockDbCall(); // start tx

    // Batch update wallets using cases or simple batch
    // Assume we batch them into chunks or a single query
    await mockDbCall(); // 1 query for all wallets (or a few batched queries)

    // Batch insert ledger entries
    await mockDbCall(); // 1 query for all ledger entries

    // Batch update trades
    await mockDbCall(); // 1 query for all trades

    // Match update
    await mockDbCall(); // 1 query for match

    // end tx
  }

  const end = performance.now();
  return end - start;
}

async function run() {
  console.log("Measuring current implementation (N+1)...");
  const timeN1 = await runBenchmark(false);
  console.log(`Current: ${timeN1.toFixed(2)} ms`);

  console.log("\nMeasuring optimized implementation (Batched)...");
  const timeBatched = await runBenchmark(true);
  console.log(`Batched: ${timeBatched.toFixed(2)} ms`);

  const speedup = timeN1 / timeBatched;
  console.log(`\nSpeedup: ${speedup.toFixed(2)}x faster`);
}

run();
