#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const { setTimeout: sleep } = require("node:timers/promises");
const { createRequire } = require("node:module");

const repoRoot = __dirname;
const webRoot = path.join(repoRoot, "sbe", "web");
const reportRoot = path.join(repoRoot, "artifacts", "kinetic-ledger-debug");
const reportJsonPath = path.join(reportRoot, "latest.json");
const reportMarkdownPath = path.join(reportRoot, "latest.md");
const pulledEnvPath = path.join(reportRoot, ".vercel.production.env");
const windows = process.platform === "win32";
const npmCommand = windows ? "npm.cmd" : "npm";
const tscCommand = windows ? "node_modules\\.bin\\tsc.cmd" : path.join(webRoot, "node_modules", ".bin", "tsc");
const vercelCommand = windows ? "vercel.cmd" : "vercel";
const webRequire = createRequire(path.join(webRoot, "package.json"));
const { Pool } = webRequire("pg");
const runtimePort = Number(process.env.KINETIC_LEDGER_PORT || 3210);
const baseUrlArgIndex = process.argv.indexOf("--base-url");
const runtimeBaseUrl = baseUrlArgIndex >= 0 && process.argv[baseUrlArgIndex + 1]
  ? process.argv[baseUrlArgIndex + 1].replace(/\/$/, "")
  : `http://127.0.0.1:${runtimePort}`;
const shouldStartLocalServer = !runtimeBaseUrl.startsWith("http://127.0.0.1:") && !runtimeBaseUrl.startsWith("http://localhost:")
  ? false
  : !(baseUrlArgIndex >= 0 && process.argv[baseUrlArgIndex + 1]);
const uuidZero = "00000000-0000-0000-0000-000000000000";

main().catch((error) => {
  console.error("[kinetic-ledger] Fatal error:", error);
  process.exitCode = 1;
});

async function main() {
  ensureDir(reportRoot);

  const report = {
    startedAt: new Date().toISOString(),
    mode: shouldStartLocalServer ? "local" : "remote",
    baseUrl: runtimeBaseUrl,
    repoRoot,
    webRoot,
    checks: {},
    warnings: [],
    artifacts: {
      json: reportJsonPath,
      markdown: reportMarkdownPath,
    },
  };

  const runtimeEnv = loadRuntimeEnv(report);
  report.environment = runtimeEnv.summary;
  report.monorepo = inspectMonorepo();
  report.checks.vercelCron = inspectVercelCronConfig();
  report.checks.backendUrlLeaks = scanBackendUrlLeaks();
  report.checks.designPalette = scanDesignPalette();

  report.checks.lint = runCommand(
    npmCommand,
    ["run", "lint"],
    { cwd: webRoot, env: runtimeEnv.env }
  );
  report.checks.typecheck = runCommand(
    tscCommand,
    ["--noEmit"],
    { cwd: webRoot, env: runtimeEnv.env }
  );
  report.checks.build = runCommand(
    npmCommand,
    ["run", "build"],
    { cwd: webRoot, env: runtimeEnv.env }
  );
  report.checks.test = runCommand(
    npmCommand,
    ["run", "test"],
    { cwd: webRoot, env: runtimeEnv.env }
  );

  const database = await inspectDatabase(runtimeEnv.env);
  report.checks.database = database.summary;
  report.samples = database.samples;
  report.adminUser = database.adminUser
    ? { id: database.adminUser.id, username: database.adminUser.username, role: database.adminUser.role }
    : null;
  report.probeUser = database.probeUser
    ? { id: database.probeUser.id, username: database.probeUser.username, role: database.probeUser.role }
    : null;

  report.checks.supabase = await inspectSupabaseRest(runtimeEnv.env);

  let server = null;

  try {
    if (shouldStartLocalServer && report.checks.build.ok) {
      server = startLocalServer(runtimeEnv.env);
      report.checks.runtime = await waitForServer(runtimeBaseUrl, server);
    } else if (shouldStartLocalServer) {
      report.checks.runtime = {
        ok: false,
        name: "runtime",
        reason: "Skipped local server startup because the build failed.",
      };
    } else {
      report.checks.runtime = await waitForRemote(runtimeBaseUrl);
    }

    if (report.checks.runtime.ok) {
      report.checks.routes = await probeRoutes({
        probeUser: database.probeUser,
        baseUrl: runtimeBaseUrl,
        env: runtimeEnv.env,
        samples: database.samples,
      });
    } else {
      report.checks.routes = {
        ok: false,
        name: "routes",
        reason: "Route probes skipped because the target server was not reachable.",
        probes: [],
      };
    }
  } finally {
    await stopServer(server);
    cleanupPulledEnv();
  }

  report.finishedAt = new Date().toISOString();
  report.summary = buildSummary(report);
  writeReports(report);

  console.log(`[kinetic-ledger] Report written to ${reportMarkdownPath}`);
  console.log(`[kinetic-ledger] Health: ${report.summary.clean ? "CLEAN" : "ATTENTION REQUIRED"}`);

  if (!report.summary.clean) {
    process.exitCode = 1;
  }
}

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true });
}

function loadRuntimeEnv(report) {
  const env = { ...process.env };
  const pullTarget =
    path.relative(webRoot, pulledEnvPath).split(path.sep).join("/") ||
    "../../artifacts/kinetic-ledger-debug/.vercel.production.env";
  const pullArgs = ["env", "pull", pullTarget, "--environment=production", "--yes"];
  let pullResult = runCommand(vercelCommand, pullArgs, { cwd: webRoot, env });
  let scopeUsed = null;

  if (!pullResult.ok) {
    const scopeHint = inferVercelScope(env);
    if (scopeHint) {
      scopeUsed = scopeHint;
      pullResult = runCommand(
        vercelCommand,
        [...pullArgs, "--scope", scopeHint],
        { cwd: webRoot, env }
      );
    }
  }

  if (!pullResult.ok) {
    report.warnings.push("Falling back to the current shell environment because `vercel env pull` did not succeed.");
  }

  if (fs.existsSync(pulledEnvPath)) {
    const pulledVars = parseEnvFile(fs.readFileSync(pulledEnvPath, "utf8"));
    Object.assign(env, pulledVars);
  }

  if (!env.SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_URL) {
    env.SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
  }
  if (!env.SUPABASE_ANON_KEY && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    env.SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  const trackedNames = [
    "DATABASE_URL",
    "JWT_SECRET",
    "CRON_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_APP_URL",
    "BACKEND_URL",
  ];
  const summary = {};

  for (const name of trackedNames) {
    const value = env[name];
    summary[name] = {
      present: Boolean(value),
      length: value ? value.length : 0,
    };
  }

  summary.source = {
    envPullSucceeded: pullResult.ok,
    pulledEnvPath,
    scopeUsed,
  };

  return { env, summary };
}

function inferVercelScope(env) {
  const explicitScope = env.VERCEL_SCOPE || env.VERCEL_OWNER;
  if (typeof explicitScope === "string" && explicitScope.trim()) {
    return explicitScope.trim();
  }

  const oidcToken = env.VERCEL_OIDC_TOKEN || readEnvValueFromFile(path.join(webRoot, ".env.local"), "VERCEL_OIDC_TOKEN");
  if (!oidcToken) {
    return null;
  }

  const payload = parseJwtPayload(oidcToken);
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (typeof payload.owner === "string" && payload.owner.trim()) {
    return payload.owner.trim();
  }

  if (typeof payload.iss === "string") {
    const parts = payload.iss.split("/");
    const owner = parts[parts.length - 1];
    return owner ? owner.trim() : null;
  }

  return null;
}

function readEnvValueFromFile(filePath, key) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const values = parseEnvFile(fs.readFileSync(filePath, "utf8"));
  const value = values[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function parseEnvFile(text) {
  const values = {};
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    let value = match[2] || "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[match[1]] = value.replace(/\\r\\n/g, "").trim();
  }

  return values;
}

function inspectMonorepo() {
  const packages = [
    {
      name: "sbe/web",
      packageJson: path.join(repoRoot, "sbe", "web", "package.json"),
    },
    {
      name: "sbe/backend",
      packageJson: path.join(repoRoot, "sbe", "backend", "package.json"),
    },
    {
      name: "jmd-mobile",
      packageJson: path.join(repoRoot, "jmd-mobile", "package.json"),
    },
  ];

  return packages.map((pkg) => ({
    name: pkg.name,
    exists: fs.existsSync(pkg.packageJson),
    packageJson: normalizePath(pkg.packageJson),
  }));
}

function inspectVercelCronConfig() {
  const vercelConfigPath = path.join(webRoot, "vercel.json");
  if (!fs.existsSync(vercelConfigPath)) {
    return {
      ok: false,
      name: "vercel-cron",
      reason: "sbe/web vercel.json is missing.",
    };
  }

  try {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, "utf8"));
    const cron = Array.isArray(config.crons)
      ? config.crons.find((entry) => entry.path === "/api/cron/settle-markets")
      : null;

    return {
      ok: Boolean(cron),
      name: "vercel-cron",
      schedule: cron?.schedule ?? null,
      path: cron?.path ?? null,
      configPath: normalizePath(vercelConfigPath),
    };
  } catch (error) {
    return {
      ok: false,
      name: "vercel-cron",
      reason: error instanceof Error ? error.message : "Unable to parse sbe/web vercel.json.",
    };
  }
}

function scanBackendUrlLeaks() {
  const files = collectFiles(path.join(webRoot, "src"), /\.(ts|tsx|js|jsx)$/);
  const matches = [];

  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes("BACKEND_URL")) {
        matches.push({
          file: normalizePath(file),
          line: index + 1,
          text: line.trim(),
        });
      }
    });
  }

  return {
    ok: matches.length === 0,
    name: "backend-url-leaks",
    count: matches.length,
    matches,
  };
}

function scanDesignPalette() {
  const files = collectFiles(path.join(webRoot, "src"), /\.(css|ts|tsx)$/);
  const allowed = new Set(["#000000", "#f5f5f7", "#0071e3", "#ffffff", "#1d1d1f"]);
  const disallowed = new Map();

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const regex = /#[0-9a-fA-F]{6}\b/g;
    let match = regex.exec(content);

    while (match) {
      const color = match[0].toLowerCase();
      if (!allowed.has(color)) {
        if (!disallowed.has(color)) {
          disallowed.set(color, []);
        }
        disallowed.get(color).push(normalizePath(file));
      }
      match = regex.exec(content);
    }
  }

  return {
    ok: true,
    name: "design-palette",
    disallowedColorCount: disallowed.size,
    disallowedColors: Array.from(disallowed.entries()).map(([color, filesUsing]) => ({
      color,
      count: filesUsing.length,
      sampleFiles: Array.from(new Set(filesUsing)).slice(0, 5),
    })),
  };
}

function collectFiles(root, extensionPattern) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const results = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, extensionPattern));
      continue;
    }

    if (extensionPattern.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

function runCommand(command, args, options = {}) {
  const startedAt = Date.now();
  const result = spawnSync(command, args, {
    cwd: options.cwd || repoRoot,
    env: options.env || process.env,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
    shell: windows,
    windowsHide: true,
  });

  return {
    name: [command, ...args].join(" "),
    ok: result.status === 0,
    code: result.status,
    error: result.error ? result.error.message : null,
    durationMs: Date.now() - startedAt,
    stdout: trimOutput(result.stdout),
    stderr: trimOutput(result.stderr),
  };
}

function trimOutput(output) {
  if (!output) {
    return "";
  }

  const lines = output.trim().split(/\r?\n/);
  return lines.slice(-80).join("\n");
}

async function inspectDatabase(env) {
  const summary = {
    ok: false,
    name: "database",
  };
  const samples = {
    announcementId: uuidZero,
    depositId: uuidZero,
    matchId: uuidZero,
    tournamentId: uuidZero,
    withdrawalId: uuidZero,
  };

  if (!env.DATABASE_URL) {
    summary.reason = "DATABASE_URL is missing.";
    return { summary, samples, adminUser: null, probeUser: null };
  }

  const pool = new Pool({
    connectionString: env.DATABASE_URL.trim(),
    ssl: { rejectUnauthorized: false },
    max: 2,
  });

  try {
    const client = await pool.connect();

    try {
      const databaseInfo = await client.query(
        "select current_database() as database, current_schema() as schema, current_setting('server_version') as version"
      );
      const schemaInfo = await client.query(
        `select table_name, column_name, data_type, udt_name
         from information_schema.columns
         where table_schema = 'public' and table_name = any($1::text[])`,
        [["matches", "odds_markets", "wallets"]]
      );
      const adminResult = await client.query(
        `select id, username, role
         from public.users
         where role = 'admin'
         order by created_at asc
         limit 1`
      );
      const userResult = await client.query(
        `select id, username, role
         from public.users
         order by created_at asc
         limit 1`
      );
      const sampleResult = await client.query(
        `select
           (select id from public.matches order by created_at desc limit 1) as "matchId",
           (select id from public.tournaments order by created_at desc limit 1) as "tournamentId",
           (select id from public.deposit_requests order by created_at desc limit 1) as "depositId",
           (select id from public.withdrawal_requests order by created_at desc limit 1) as "withdrawalId",
           (select id from public.announcements order by created_at desc limit 1) as "announcementId"`
      );

      Object.assign(samples, sampleResult.rows[0] || {});

      const schemaChecks = validateCoreSchema(schemaInfo.rows);
      summary.ok = schemaChecks.ok;
      summary.database = databaseInfo.rows[0]?.database ?? null;
      summary.schema = databaseInfo.rows[0]?.schema ?? null;
      summary.version = databaseInfo.rows[0]?.version ?? null;
      summary.schemaChecks = schemaChecks;

      return {
        summary,
        samples,
        adminUser: adminResult.rows[0] || null,
        probeUser: userResult.rows[0] || null,
      };
    } finally {
      client.release();
    }
  } catch (error) {
    summary.reason = error instanceof Error ? error.message : "Database inspection failed.";
    return {
      summary,
      samples,
      adminUser: null,
      probeUser: null,
    };
  } finally {
    await pool.end().catch(() => {});
  }
}

function validateCoreSchema(rows) {
  const expected = {
    matches: {
      id: ["uuid"],
      team_a: ["text"],
      team_b: ["text"],
      status: ["USER-DEFINED", "text"],
      start_time: ["timestamp without time zone"],
    },
    wallets: {
      id: ["uuid"],
      user_id: ["uuid"],
      currency: ["character varying"],
      balance: ["numeric"],
      locked_balance: ["numeric"],
    },
  };
  const grouped = {};

  for (const row of rows) {
    if (!grouped[row.table_name]) {
      grouped[row.table_name] = {};
    }
    grouped[row.table_name][row.column_name] = row;
  }

  const failures = [];

  for (const [tableName, columns] of Object.entries(expected)) {
    if (!grouped[tableName]) {
      failures.push(`${tableName} is missing.`);
      continue;
    }

    for (const [columnName, acceptedTypes] of Object.entries(columns)) {
      const actual = grouped[tableName][columnName];
      if (!actual) {
        failures.push(`${tableName}.${columnName} is missing.`);
        continue;
      }

      if (!acceptedTypes.includes(actual.data_type)) {
        failures.push(
          `${tableName}.${columnName} expected ${acceptedTypes.join(" or ")} but found ${actual.data_type}.`
        );
      }
    }
  }

  const oddsMarketVariants = [
    {
      name: "legacy",
      columns: {
        id: ["uuid"],
        match_id: ["uuid"],
        market_name: ["text", "character varying"],
        selection: ["text", "character varying"],
        odds: ["numeric"],
      },
    },
    {
      name: "serverless",
      columns: {
        id: ["uuid"],
        event_id: ["uuid"],
        market_name: ["text", "character varying"],
        outcome: ["text", "character varying"],
        back_odds: ["numeric"],
        lay_odds: ["numeric"],
      },
    },
  ];
  const oddsMarketColumns = grouped.odds_markets || {};
  const matchingOddsVariant = oddsMarketVariants.find((variant) =>
    Object.entries(variant.columns).every(([columnName, acceptedTypes]) => {
      const actual = oddsMarketColumns[columnName];
      return actual && acceptedTypes.includes(actual.data_type);
    })
  );

  if (!matchingOddsVariant) {
    failures.push(
      "odds_markets schema does not match either the legacy or serverless column layout."
    );
  }

  return {
    ok: failures.length === 0,
    failures,
    oddsVariant: matchingOddsVariant?.name ?? null,
  };
}

async function inspectSupabaseRest(env) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      ok: false,
      name: "supabase",
      reason: "Supabase URL or API key is missing.",
    };
  }

  try {
    const url = new URL("/rest/v1/tenants?select=id&limit=1", supabaseUrl);
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    const body = await response.text();

    return {
      ok: response.ok,
      name: "supabase",
      status: response.status,
      body: body.slice(0, 400),
    };
  } catch (error) {
    return {
      ok: false,
      name: "supabase",
      reason: error instanceof Error ? error.message : "Supabase REST probe failed.",
    };
  }
}

function startLocalServer(env) {
  const child = spawn(
    npmCommand,
    ["run", "start", "--", "-p", String(runtimePort)],
    {
      cwd: webRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: windows,
      windowsHide: true,
    }
  );

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.logs = [];
  child.stdout.on("data", (chunk) => child.logs.push(chunk));
  child.stderr.on("data", (chunk) => child.logs.push(chunk));

  return child;
}

async function waitForServer(baseUrl, child) {
  const deadline = Date.now() + 90000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      return {
        ok: false,
        name: "runtime",
        reason: "Next.js server exited before becoming ready.",
        logs: child.logs.join("").trim().slice(-4000),
      };
    }

    try {
      const response = await fetch(`${baseUrl}/en`, { redirect: "manual" });
      if (response.status < 500) {
        return {
          ok: true,
          name: "runtime",
          status: response.status,
        };
      }
    } catch {
      // Keep polling.
    }

    await sleep(1000);
  }

  return {
    ok: false,
    name: "runtime",
    reason: "Timed out waiting for the local server to respond.",
    logs: child.logs.join("").trim().slice(-4000),
  };
}

async function waitForRemote(baseUrl) {
  const deadline = Date.now() + 45000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/en`, { redirect: "manual" });
      if (response.status < 500) {
        return {
          ok: true,
          name: "runtime",
          status: response.status,
        };
      }
    } catch {
      // Keep polling.
    }

    await sleep(1000);
  }

  return {
    ok: false,
    name: "runtime",
    reason: `Timed out waiting for ${baseUrl} to respond.`,
  };
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  if (windows) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { encoding: "utf8" });
    return;
  }

  child.kill("SIGTERM");
  await sleep(1000);
  if (child.exitCode === null) {
    child.kill("SIGKILL");
  }
}

async function probeRoutes({ probeUser, baseUrl, env, samples }) {
  const probes = [];

  if (!env.JWT_SECRET) {
    return {
      ok: false,
      name: "routes",
      reason: "JWT_SECRET is unavailable, so authenticated route probes could not run.",
      probes,
    };
  }

  const userToken = probeUser
    ? signJwt(
        {
          id: probeUser.id,
          userId: probeUser.id,
          role: probeUser.role,
          username: probeUser.username,
        },
        env.JWT_SECRET
      )
    : null;
  const adminToken = signJwt(
    {
      id: probeUser?.id || uuidZero,
      userId: probeUser?.id || uuidZero,
      role: "admin",
      username: probeUser?.username || "admin-probe",
    },
    env.JWT_SECRET
  );

  if (userToken) {
    probes.push(await requestProbe(baseUrl, {
      name: "auth-me",
      path: "/api/auth/me",
      headers: { Cookie: `sbe_token=${userToken}` },
      healthyStatuses: [200],
    }));
  }

  probes.push(await requestProbe(baseUrl, {
    name: "matches-list",
    path: "/api/matches",
    healthyStatuses: [200],
  }));
  probes.push(await requestProbe(baseUrl, {
    name: "matches-active",
    path: "/api/matches/active",
    healthyStatuses: [200],
  }));
  probes.push(await requestProbe(baseUrl, {
    name: "match-detail",
    path: `/api/matches/${samples.matchId || uuidZero}`,
    healthyStatuses: [200, 404],
  }));
  probes.push(await requestProbe(baseUrl, {
    name: "ai-insights",
    path: `/api/ai/insights/${samples.matchId || uuidZero}`,
    healthyStatuses: [200, 404],
  }));
  probes.push(await requestProbe(baseUrl, {
    name: "tenant-config",
    path: "/api/tenant/config",
    healthyStatuses: [200],
  }));

  const adminGetPaths = [
    { name: "admin-matches", path: "/api/admin/matches" },
    { name: "admin-match-detail", path: `/api/admin/matches/${samples.matchId || uuidZero}` },
    { name: "admin-tournaments", path: "/api/admin/tournaments" },
    { name: "admin-users", path: "/api/admin/users" },
    { name: "admin-deposits", path: "/api/admin/deposits" },
    { name: "admin-withdrawals", path: "/api/admin/withdrawals" },
    { name: "admin-announcements", path: "/api/admin/announcements" },
  ];

  for (const probe of adminGetPaths) {
    probes.push(await requestProbe(baseUrl, {
      name: probe.name,
      path: probe.path,
      headers: { Cookie: `sbe_token=${adminToken}` },
      healthyStatuses: [200],
    }));
  }

  const mutationProbes = [
    {
      name: "approve-deposit-route",
      path: `/api/admin/deposits/${uuidZero}/approve`,
      method: "POST",
      body: {},
    },
    {
      name: "reject-deposit-route",
      path: `/api/admin/deposits/${uuidZero}/reject`,
      method: "POST",
      body: {},
    },
    {
      name: "approve-withdrawal-route",
      path: `/api/admin/withdrawals/${uuidZero}/approve`,
      method: "POST",
      body: {},
    },
    {
      name: "reject-withdrawal-route",
      path: `/api/admin/withdrawals/${uuidZero}/reject`,
      method: "POST",
      body: {},
    },
    {
      name: "settle-match-route",
      path: `/api/admin/matches/${uuidZero}/settle`,
      method: "POST",
      body: { result: "team_a" },
    },
  ];

  for (const probe of mutationProbes) {
    probes.push(await requestProbe(baseUrl, {
      name: probe.name,
      method: probe.method,
      path: probe.path,
      body: probe.body,
      headers: { Cookie: `sbe_token=${adminToken}` },
      healthyStatuses: [200, 400, 404],
    }));
  }

  probes.push(await requestProbe(baseUrl, {
    name: "cron-settle-markets",
    path: "/api/cron/settle-markets",
    headers: {
      Authorization: `Bearer ${env.CRON_SECRET || ""}`,
    },
    healthyStatuses: [200],
  }));

  return {
    ok: probes.every((probe) => probe.ok),
    name: "routes",
    probes,
  };
}

async function requestProbe(baseUrl, options) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${baseUrl}${options.path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      redirect: "manual",
    });
    const text = await response.text();

    return {
      ok: options.healthyStatuses.includes(response.status),
      name: options.name,
      method: options.method || "GET",
      path: options.path,
      status: response.status,
      body: text.slice(0, 400),
    };
  } catch (error) {
    return {
      ok: false,
      name: options.name,
      method: options.method || "GET",
      path: options.path,
      reason: error instanceof Error ? error.message : "Route probe failed.",
    };
  }
}

function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + 60 * 60,
  };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString("base64url");
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(unsigned)
    .digest("base64url");

  return `${unsigned}.${signature}`;
}

function buildSummary(report) {
  const blockingChecks = [
    report.checks.vercelCron.ok,
    report.checks.backendUrlLeaks.ok,
    report.checks.lint.ok,
    report.checks.typecheck.ok,
    report.checks.build.ok,
    report.checks.test.ok,
    report.checks.database.ok,
    report.checks.supabase.ok,
    report.checks.runtime.ok,
    report.checks.routes.ok,
  ];

  return {
    clean: blockingChecks.every(Boolean),
    warnings: report.warnings.length + report.checks.designPalette.disallowedColorCount,
  };
}

function writeReports(report) {
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(reportMarkdownPath, renderMarkdown(report));
}

function renderMarkdown(report) {
  const routeLines = Array.isArray(report.checks.routes.probes)
    ? report.checks.routes.probes
        .map((probe) => {
          const status = probe.status !== undefined ? `status ${probe.status}` : probe.reason;
          return `- ${probe.ok ? "PASS" : "FAIL"} ${probe.method || "GET"} ${probe.path}: ${status}`;
        })
        .join("\n")
    : "- Route probes were skipped.";

  const leakLines = report.checks.backendUrlLeaks.matches.length > 0
    ? report.checks.backendUrlLeaks.matches
        .map((match) => `- ${match.file}:${match.line} -> ${match.text}`)
        .join("\n")
    : "- No BACKEND_URL leaks found in sbe/web source.";

  const paletteLines = report.checks.designPalette.disallowedColors.length > 0
    ? report.checks.designPalette.disallowedColors
        .slice(0, 12)
        .map((entry) => `- ${entry.color}: ${entry.count} occurrence(s)`)
        .join("\n")
    : "- No non-core hex colors found.";

  return [
    "# Kinetic Ledger Debug Report",
    "",
    `- Started: ${report.startedAt}`,
    `- Finished: ${report.finishedAt}`,
    `- Mode: ${report.mode}`,
    `- Target: ${report.baseUrl}`,
    `- Health: ${report.summary.clean ? "CLEAN" : "ATTENTION REQUIRED"}`,
    "",
    "## Core Checks",
    `- Vercel cron config: ${report.checks.vercelCron.ok ? "PASS" : "FAIL"}`,
    `- Lint: ${report.checks.lint.ok ? "PASS" : "FAIL"}`,
    `- Typecheck: ${report.checks.typecheck.ok ? "PASS" : "FAIL"}`,
    `- Build: ${report.checks.build.ok ? "PASS" : "FAIL"}`,
    `- Test: ${report.checks.test.ok ? "PASS" : "FAIL"}`,
    `- Database: ${report.checks.database.ok ? "PASS" : "FAIL"}`,
    `- Supabase REST: ${report.checks.supabase.ok ? "PASS" : "FAIL"}`,
    `- Runtime: ${report.checks.runtime.ok ? "PASS" : "FAIL"}`,
    `- Routes: ${report.checks.routes.ok ? "PASS" : "FAIL"}`,
    "",
    "## Route Probes",
    routeLines,
    "",
    "## BACKEND_URL Audit",
    leakLines,
    "",
    "## Design Audit",
    paletteLines,
    "",
    "## Commands",
    "```text",
    report.checks.lint.name,
    report.checks.typecheck.name,
    report.checks.build.name,
    report.checks.test.name,
    "```",
    "",
  ].join("\n");
}

function cleanupPulledEnv() {
  if (fs.existsSync(pulledEnvPath)) {
    fs.rmSync(pulledEnvPath, { force: true });
  }
}

function normalizePath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
