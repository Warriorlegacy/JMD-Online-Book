import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:4000";

function getAuthHeaders(request: NextRequest) {
  const token = request.cookies.get("sbe_token")?.value;
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    let backendPath: string;
    if (path.endsWith("/balance")) {
      backendPath = "/wallet/balance";
    } else if (path.endsWith("/transactions")) {
      backendPath = "/wallet/transactions";
    } else {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 });
    }

    const res = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: "GET",
      headers: getAuthHeaders(request),
      next: { revalidate: 5 },
    });

    const data = await res.json();
    return new NextResponse(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;

    let backendPath: string;
    if (path.endsWith("/deposit")) {
      backendPath = "/wallet/deposit";
    } else if (path.endsWith("/withdraw")) {
      backendPath = "/wallet/withdraw";
    } else {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 404 });
    }

    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}${backendPath}`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(request),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return new NextResponse(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process wallet operation" },
      { status: 500 }
    );
  }
}
