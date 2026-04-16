import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function proxyRequest(request: NextRequest, endpoint: string) {
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}${endpoint}${url.search}`;
  
  const headers = new Headers(request.headers);
  // Remove host header to avoid SSL/Host mismatch issues in some environments
  headers.delete("host");

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? await request.blob() : null,
      cache: "no-store",
    });

    const responseHeaders = new Headers(res.headers);
    // Ensure we don't accidentally pass through backend-specific headers that might break Next.js
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

export async function GET(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const endpoint = pathname.replace("/api", "");
  return proxyRequest(request, endpoint);
}

export async function POST(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const endpoint = pathname.replace("/api", "");
  return proxyRequest(request, endpoint);
}

export async function DELETE(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const endpoint = pathname.replace("/api", "");
  return proxyRequest(request, endpoint);
}

export async function PATCH(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  const endpoint = pathname.replace("/api", "");
  return proxyRequest(request, endpoint);
}
