import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (auth page)
     * - /api/auth (NextAuth routes)
     * - /_next (Next.js internals)
     * - /favicon.ico, /settings.yaml, /chat-openers.yaml, /full-description.md (public static)
     */
    "/((?!login|api/auth|_next|favicon\\.ico|settings\\.yaml|chat-openers\\.yaml|full-description\\.md|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico).*)",
  ],
};
