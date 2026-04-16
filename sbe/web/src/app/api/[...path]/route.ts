import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);
  // Remove /api from the start to get the actual backend endpoint
  const endpoint = url.pathname.replace(/^\/api/, "");
  const targetUrl = `${BACKEND_URL}${endpoint}${url.search}`;
  
  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers,
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = await request.blob();
    }

    const res = await fetch(targetUrl, fetchOptions);

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("content-encoding");

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[Proxy Error] ${targetUrl}:`, err);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
