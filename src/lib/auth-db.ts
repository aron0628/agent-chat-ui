import { query } from "./db";

export interface UserRow {
  user_id: string;
  display_name: string;
  email: string;
  hashed_password: string;
  is_active: boolean;
  session_version: number;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ThreadRow {
  thread_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(
  email: string,
): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    "SELECT * FROM users WHERE email = $1 AND is_active = true",
    [email],
  );
  return rows[0] ?? null;
}

export async function getUserByEmailOrUserId(
  identifier: string,
): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    "SELECT * FROM users WHERE (email = $1 OR user_id = $1) AND is_active = true",
    [identifier],
  );
  return rows[0] ?? null;
}

export async function getUserById(
  userId: string,
): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    "SELECT * FROM users WHERE user_id = $1",
    [userId],
  );
  return rows[0] ?? null;
}

export async function getSessionVersion(
  userId: string,
): Promise<number> {
  const rows = await query<{ session_version: number }>(
    "SELECT session_version FROM users WHERE user_id = $1",
    [userId],
  );
  if (!rows[0]) throw new Error(`User not found: ${userId}`);
  return rows[0].session_version;
}

export async function getThreadIdsByUserId(
  userId: string,
): Promise<string[]> {
  const rows = await query<{ thread_id: string }>(
    "SELECT thread_id FROM user_threads WHERE user_id = $1 ORDER BY created_at DESC",
    [userId],
  );
  return rows.map((r) => r.thread_id);
}

export async function insertUserThread(
  threadId: string,
  userId: string,
): Promise<void> {
  await query(
    "INSERT INTO user_threads (thread_id, user_id) VALUES ($1, $2) ON CONFLICT (thread_id) DO NOTHING",
    [threadId, userId],
  );
}

export async function isThreadOwnedByUser(
  threadId: string,
  userId: string,
): Promise<boolean> {
  const rows = await query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM user_threads WHERE thread_id = $1 AND user_id = $2) as exists",
    [threadId, userId],
  );
  return rows[0]?.exists ?? false;
}
