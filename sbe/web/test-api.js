async function check() {
  const res = await fetch("https://jmd-online-book.vercel.app/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "test_api_v_1",
      email: "test_api_v1@example.com",
      password: "password123"
    })
  });
  console.log(res.status, await res.text());
}
check();
