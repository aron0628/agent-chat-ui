import { auth } from "@/lib/auth";
import { insertUserThread, isThreadOwnedByUser } from "@/lib/auth-db";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const LANGGRAPH_API_URL =
  process.env.LANGGRAPH_API_URL ?? "http://localhost:2024";
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY ?? "";

// CORS headers — origin is restricted to ALLOWED_ORIGIN env var.
// If ALLOWED_ORIGIN is not set, no origin is allowed (fail-secure).
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "";
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
  "Access-Control-Allow-Credentials": "true",
  "Vary": "Origin",
};

// Extract thread ID from path like /api/threads/{threadId}/...
function extractThreadIdFromPath(path: string): string | null {
  const match = path.match(/\/threads\/([^/]+)/);
  if (match && match[1] !== undefined) {
    // Only if it looks like a real ID (not the word "search" or other sub-routes)
    const candidate = match[1];
    if (candidate === "search") return null;
    return candidate;
  }
  return null;
}

// Check if path is a thread-specific route (not thread listing/creation)
function isThreadSpecificRoute(path: string): boolean {
  const match = path.match(/\/threads\/([^/]+)/);
  if (!match) return false;
  const candidate = match[1];
  return candidate !== "search" && candidate !== undefined;
}

// Check if this is a runs route that needs body-level thread_id check
function isRunsPostRoute(method: string, path: string): boolean {
  return method === "POST" && /\/runs(\/|$)/.test(path);
}

async function proxyRequest(
  request: NextRequest,
  params: { _path: string[] },
): Promise<Response> {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const userId = session.user.id;

  // Build upstream path — strip _path/nxtP_path query params
  const pathSegments = params._path ?? [];
  const upstreamPath = "/" + pathSegments.join("/");
  const url = new URL(upstreamPath, LANGGRAPH_API_URL);

  // Copy query params, excluding Next.js internal ones
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "_path" && key !== "nxtP_path") {
      url.searchParams.set(key, value);
    }
  });

  // 2. Thread ownership check — path-level
  if (isThreadSpecificRoute(upstreamPath)) {
    const threadId = extractThreadIdFromPath(upstreamPath);
    if (threadId) {
      try {
        const owned = await isThreadOwnedByUser(threadId, userId);
        if (!owned) {
          // Auto-register ownership for race condition:
          // onThreadId fires INSERT concurrently, record may not exist yet.
          try {
            await insertUserThread(threadId, userId);
          } catch {
            return NextResponse.json(
              { error: "Access denied" },
              { status: 403, headers: CORS_HEADERS },
            );
          }
        }
      } catch {
        // DB error — fail-secure
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500, headers: CORS_HEADERS },
        );
      }
    }
  }

  // 3. Thread ownership check — body-level for /runs routes
  let bodyForUpstream: BodyInit | null = null;
  if (isRunsPostRoute(request.method, upstreamPath)) {
    try {
      const cloned = request.clone();
      const body = await cloned.json();
      const threadId = body?.thread_id;

      if (threadId) {
        try {
          const owned = await isThreadOwnedByUser(threadId, userId);
          if (!owned) {
            // Auto-register ownership for race condition:
            // onThreadId callback fires INSERT concurrently with /runs POST,
            // so the record may not exist yet. Register it here to resolve.
            try {
              await insertUserThread(threadId, userId);
            } catch {
              return NextResponse.json(
                { error: "Access denied" },
                { status: 403, headers: CORS_HEADERS },
              );
            }
          }
        } catch {
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: CORS_HEADERS },
          );
        }
      }

      bodyForUpstream = JSON.stringify(body);
    } catch {
      // Body parse error for runs — let it pass through (some runs may not have body)
      bodyForUpstream = request.body;
    }
  } else if (["POST", "PUT", "PATCH"].includes(request.method)) {
    bodyForUpstream = request.body;
  }

  // 4. Proxy the request to LangGraph
  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("content-type") ?? "application/json",
  };

  if (LANGSMITH_API_KEY) {
    headers["X-Api-Key"] = LANGSMITH_API_KEY;
  }

  const LANGGRAPH_AUTH_KEY = process.env.LANGGRAPH_AUTH_KEY ?? "";
  if (LANGGRAPH_AUTH_KEY) {
    headers["Authorization"] = `Bearer ${LANGGRAPH_AUTH_KEY}`;
  }

  try {
    const upstreamResponse = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: bodyForUpstream,
      // @ts-expect-error - duplex is needed for streaming request bodies
      duplex: bodyForUpstream && typeof bodyForUpstream !== "string" ? "half" : undefined,
    });

    // Stream the response back
    const responseHeaders = new Headers(CORS_HEADERS);
    upstreamResponse.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== "transfer-encoding" &&
        key.toLowerCase() !== "connection"
      ) {
        responseHeaders.set(key, value);
      }
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[API Proxy] Upstream error:", error);
    return NextResponse.json(
      { error: "Failed to connect to LangGraph server" },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}

// Helper to extract params from the request
function withParams(handler: (request: NextRequest, params: { _path: string[] }) => Promise<Response>) {
  return async (request: NextRequest, context: { params: Promise<{ _path: string[] }> }) => {
    const params = await context.params;
    return handler(request, params);
  };
}

export const GET = withParams(proxyRequest);
export const POST = withParams(proxyRequest);
export const PUT = withParams(proxyRequest);
export const PATCH = withParams(proxyRequest);
export const DELETE = withParams(proxyRequest);

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
