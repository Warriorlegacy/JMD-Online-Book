import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { matches, tournaments, matchStatusEnum } from "./src/db/schema.js";
import crypto from "crypto";

async function seed() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool);

    console.log("🌱 Seeding database...");

    // Create a tournament
    const [tournament] = await db.insert(tournaments).values({
      name: "Premier League 2026",
      sportType: "football",
      metadata: JSON.stringify({ country: "England", season: "2025-26" }),
    }).returning();

    console.log("✅ Tournament created:", tournament.name);

    // Create an active match
    const [match] = await db.insert(matches).values({
      tournamentId: tournament.id,
      teamA: "Manchester City",
      teamB: "Arsenal",
      startTime: new Date(Date.now() + 3600000), // 1 hour from now
      status: "in_play",
      metadata: JSON.stringify({ venue: "Etihad Stadium", round: "Matchday 30" }),
    }).returning();

    console.log("✅ Match created:", `${match.teamA} v ${match.teamB}`);

    // Create a scheduled match
    const [match2] = await db.insert(matches).values({
      tournamentId: tournament.id,
      teamA: "Liverpool",
      teamB: "Chelsea",
      startTime: new Date(Date.now() + 86400000), // Tomorrow
      status: "scheduled",
      metadata: JSON.stringify({ venue: "Anfield", round: "Matchday 30" }),
    }).returning();

    console.log("✅ Match created:", `${match2.teamA} v ${match2.teamB}`);

    console.log("🎉 Database seeded successfully!");
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
