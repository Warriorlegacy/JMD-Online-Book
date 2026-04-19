const fs = require('fs');
const path = 'sbe/backend/src/routes/admin.ts';
let code = fs.readFileSync(path, 'utf8');

const target = `  // List all matches
  fastify.get("/matches", async () => {
    const result = await db.execute(
      sql\`SELECT id, tournament_id, team_a, team_b, start_time, status, metadata, created_at
          FROM matches ORDER BY start_time ASC LIMIT 50\`
    );
    return result.rows;
  });`;

const replacement = `  // List all matches
  fastify.get("/matches", async (request, reply) => {
    try {
      const result = await db.execute(
        sql\`SELECT m.id, m.tournament_id, t.name as tournament_name, t.sport_type, m.team_a, m.team_b, m.start_time, m.status, m.metadata, m.created_at
            FROM matches m
            LEFT JOIN tournaments t ON m.tournament_id = t.id
            ORDER BY m.start_time ASC LIMIT 50\`
      );
      return result.rows;
    } catch (err: any) {
      fastify.log.error(err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  });`;

if (code.includes(target)) {
  fs.writeFileSync(path, code.replace(target, replacement));
  console.log("Replaced successfully");
} else {
  console.log("Target not found");
}
