import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "https://jmd-online-book.onrender.com";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbe_token")?.value;
  const { nextUrl } = request;
  const backendPath = nextUrl.pathname.replace(/^\/api\/admin/, "/admin");
  const url = new URL(`${BACKEND_URL}${backendPath}`);
  url.search = nextUrl.search;

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbe_token")?.value;
  const { nextUrl } = request;
  const backendPath = nextUrl.pathname.replace(/^\/api\/admin/, "/admin");
  const url = new URL(`${BACKEND_URL}${backendPath}`);
  url.search = nextUrl.search;

  const body = await request.json();
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbe_token")?.value;
  const { nextUrl } = request;
  const backendPath = nextUrl.pathname.replace(/^\/api\/admin/, "/admin");
  const url = new URL(`${BACKEND_URL}${backendPath}`);
  url.search = nextUrl.search;

  const body = await request.json();
  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbe_token")?.value;
  const { nextUrl } = request;
  const backendPath = nextUrl.pathname.replace(/^\/api\/admin/, "/admin");
  const url = new URL(`${BACKEND_URL}${backendPath}`);
  url.search = nextUrl.search;

  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbe_token")?.value;
  const { nextUrl } = request;
  const backendPath = nextUrl.pathname.replace(/^\/api\/admin/, "/admin");
  const url = new URL(`${BACKEND_URL}${backendPath}`);
  url.search = nextUrl.search;

  const body = await request.json();
  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
