import { auth } from "@/lib/auth";
import { getThreadIdsByUserId, insertUserThread } from "@/lib/auth-db";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const threadIds = await getThreadIdsByUserId(session.user.id);
    return NextResponse.json({ threadIds });
  } catch (error) {
    console.error("[user-threads] Failed to fetch thread IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { threadId } = await request.json();
    if (!threadId || typeof threadId !== "string") {
      return NextResponse.json(
        { error: "threadId is required" },
        { status: 400 },
      );
    }

    await insertUserThread(threadId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[user-threads] Failed to insert thread:", error);
    return NextResponse.json(
      { error: "Failed to record thread ownership" },
      { status: 500 },
    );
  }
}
