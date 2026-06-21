import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(status: number, code: string, message: string, details?: object) {
  return NextResponse.json({ error: { code, message, ...details } }, { status });
}

export function validationError(error: ZodError) {
  return apiError(400, "invalid_request", error.issues[0]?.message ?? "Invalid request.");
}
