# 🔍 Database Connection Diagnostic Guide

## Problem
Backend returns 500 error on `/matches/active` even though:
- ✅ Database tables exist in Supabase
- ✅ Data is present (3 matches visible)
- ✅ Backend is running (health check works)

## Diagnostic Steps

### 1. Test Database Connection

Once Render redeploys (~2 minutes), visit:
```
https://jmd-online-book.onrender.com/db-test
```

**Expected Success Response:**
```json
{
  "status": "connected",
  "database": "ok",
  "timestamp": "2026-04-14T..."
}
```

**If you see an error response:**
```json
{
  "status": "error",
  "message": "...",
  "code": "..."
}
```
→ **The DATABASE_URL is incorrect!**

---

### 2. Verify DATABASE_URL in Render

1. Go to **Render Dashboard** → Your Service → **Environment**
2. Check `DATABASE_URL` value
3. It should match your Supabase connection string exactly

**How to get the correct DATABASE_URL from Supabase:**

1. Go to **Supabase Dashboard** → **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** mode (not Transaction pooler)
4. Copy the connection string
5. It looks like: `postgresql://postgres.[project-ref]:[password]@[host]:5432/postgres`
6. Paste it in Render's `DATABASE_URL` environment variable
7. **Redeploy** the service

---

### 3. Common DATABASE_URL Issues

#### ❌ Wrong Format:
```
postgres://...  (missing 'ql')
```

#### ✅ Correct Format:
```
postgresql://postgres.xkzrlwq...:your-password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

#### ❌ Using Pooler URL:
```
postgresql://...:6543/postgres  (port 6543 is pooler - can cause issues)
```

#### ✅ Use Direct Connection:
```
postgresql://...:5432/postgres  (port 5432 is direct connection)
```

---

### 4. Test Different Endpoints

After fixing DATABASE_URL, test these in order:

```bash
# 1. Health check (should work)
https://jmd-online-book.onrender.com/health

# 2. Database test (tests connection)
https://jmd-online-book.onrender.com/db-test

# 3. Active match (tests actual query)
https://jmd-online-book.onrender.com/matches/active
```

---

### 5. Check Render Logs

If still failing:
1. Go to **Render Dashboard** → Your Service → **Logs**
2. Look for error messages when you visit `/matches/active`
3. Common errors:
   - `connection refused` → Wrong DATABASE_URL
   - `relation "matches" does not exist` → Connected to wrong database
   - `permission denied` → Database user lacks permissions

---

### 6. Quick Fix Checklist

- [ ] DATABASE_URL uses `postgresql://` (not `postgres://`)
- [ ] DATABASE_URL uses port `5432` (not `6543`)
- [ ] DATABASE_URL points to YOUR Supabase project
- [ ] Service has been redeployed after updating DATABASE_URL
- [ ] `/db-test` endpoint returns `{"status": "connected"}`

---

## Expected Flow

1. ✅ `/health` → `{"status": "ok"}`
2. ✅ `/db-test` → `{"status": "connected"}`
3. ✅ `/matches/active` → Returns match data

If step 2 fails, the issue is DATABASE_URL.
If step 2 succeeds but step 3 fails, the issue is the query/schema.

---

## Need Help?

Share the output of:
1. `/db-test` endpoint
2. Any error messages from Render logs
3. Your DATABASE_URL format (hide the password)

And I'll help you fix it! 🚀
