const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:4000';
const NUM_USERS = 10;
const REQUESTS_PER_USER = 20;

async function createTestUser(i) {
  const username = `testuser${i}`;
  const email = `test${i}@example.com`;
  const password = 'password123';
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, { username, email, password });
    return {
      token: res.data.token,
      userId: res.data.user.id,
      username
    };
  } catch (e) {
    console.error(`Failed to create user ${i}: ${e.message}`);
    return null;
  }
}

async function runLoadTest() {
  console.log(`Creating ${NUM_USERS} test users...`);
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const user = await createTestUser(i);
    if (user) users.push(user);
  }

  console.log(`Starting load test with ${users.length} users, ${REQUESTS_PER_USER} requests each...`);
  const start = Date.now();
  const results = [];

  const requests = users.flatMap(user => {
    return Array.from({ length: REQUESTS_PER_USER }).map(async (_, j) => {
      const startTime = Date.now();
      try {
        // Mix of balance requests and some other endpoint
        if (j % 2 === 0) {
          await axios.get(`${BASE_URL}/wallet/balance`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        } else {
          // We can't easily place bets without valid matchIds, so we just hit /auth/me
          await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        }
        return { success: true, duration: Date.now() - startTime };
      } catch (e) {
        return { success: false, duration: Date.now() - startTime, error: e.message };
      }
    });
  });

  await Promise.all(requests);
  const end = Date.now();
  
  const totalDuration = end - start;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Load Test Completed in ${totalDuration}ms`);
  console.log(`Total Requests: ${requests.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Avg Latency: ${totalDuration / requests.length}ms`);
}

runLoadTest().catch(console.error);
