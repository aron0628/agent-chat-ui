import { getApiKey } from "@/lib/api-key";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import {
  createContext,
  ReactNode,
  useCallback,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { useSession } from "next-auth/react";
import { createClient } from "./client";

export interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
}

export const ThreadContext = createContext<ThreadContextType | undefined>(undefined);


export function ThreadProvider({ children }: { children: ReactNode }) {
  const [apiUrl] = useQueryState("apiUrl");
  const [assistantId] = useQueryState("assistantId", {
    defaultValue: process.env.NEXT_PUBLIC_ASSISTANT_ID || "",
  });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const finalApiUrl = apiUrl || envApiUrl;
  const sanitizedAssistantId = assistantId?.trim();
  const finalAssistantId = sanitizedAssistantId || undefined;
  const { data: session } = useSession();

  const getThreads = useCallback(async (): Promise<Thread[]> => {
    if (!finalApiUrl || !finalAssistantId) return [];
    if (!session?.user?.id) return [];
    const client = createClient(finalApiUrl, getApiKey() ?? undefined);

    // Fetch owned thread IDs and all threads in parallel
    const [ownedRes, allThreads] = await Promise.all([
      fetch("/api/user-threads").then((r) => r.json()).catch(() => ({ threadIds: [] })),
      client.threads.search({ limit: 100 }),
    ]);

    const ownedIds = new Set<string>(ownedRes.threadIds ?? []);

    // If user has no threads yet, return empty
    if (ownedIds.size === 0) return [];

    return allThreads.filter((t: Thread) => ownedIds.has(t.thread_id));
  }, [finalApiUrl, finalAssistantId, session?.user?.id]);

  const value = useMemo(
    () => ({
      getThreads,
      threads,
      setThreads,
      threadsLoading,
      setThreadsLoading,
    }),
    [getThreads, threads, threadsLoading]
  );

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}
