import { NextResponse } from "next/server";
import { swaggerSpec } from "@/app/lib/swagger";
export async function GET(req: Request) {
  const { protocol, host } = new URL(req.url);
  return NextResponse.json({
    ...swaggerSpec,
    servers: [{ url: `${protocol}//${host}` }],
  });
}
