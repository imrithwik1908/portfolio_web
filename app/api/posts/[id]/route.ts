import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json({ error: "The old blog API has been retired." }, { status: 410 })
}

export const PUT = GET
export const DELETE = GET

