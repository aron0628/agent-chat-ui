import { handlers } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  // Apply rate limiting only to credential login attempts
  if (request.nextUrl.pathname.includes("/callback/credentials")) {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    const { allowed, retryAfterMs } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((retryAfterMs ?? 60000) / 1000)),
          },
        },
      );
    }
  }

  return handlers.POST(request);
}
