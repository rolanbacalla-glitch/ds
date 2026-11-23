import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "antigravity-design-system",
      version: "2.4.0",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
