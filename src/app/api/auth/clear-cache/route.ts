import { auth } from "@/lib/auth";
import { clearUserCache } from "@/lib/session-version-cache";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  clearUserCache(session.user.id);
  return NextResponse.json({ ok: true });
}
