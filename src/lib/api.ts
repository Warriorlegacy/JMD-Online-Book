import { NextResponse } from "next/server";

import type { ApiResponse } from "@/types/database";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>(
    { data, error: null },
    { status: 200, ...init },
  );
}

export function created<T>(data: T) {
  return NextResponse.json<ApiResponse<T>>(
    { data, error: null },
    { status: 201 },
  );
}

export function fail(message: string, status = 400) {
  return NextResponse.json<ApiResponse<null>>(
    { data: null, error: message },
    { status },
  );
}
