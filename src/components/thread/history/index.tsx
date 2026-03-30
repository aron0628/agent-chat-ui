"use client";

import { useThreads } from "@/hooks/useThreads";
import { useSettings } from "@/hooks/useSettings";
import { useEffect, useRef } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSession } from "next-auth/react";
import { DesktopSidebar } from "./components/DesktopSidebar";
import { MobileSidebar } from "./components/MobileSidebar";

interface ThreadHistoryProps {
  onShowGuide?: () => void;
}

export default function ThreadHistory({ onShowGuide }: ThreadHistoryProps) {
  const { config } = useSettings();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(config.threads.sidebarOpenByDefault),
  );
  const [_threadId, setThreadId] = useQueryState("threadId");
  const [apiUrl] = useQueryState("apiUrl");
  const [assistantId] = useQueryState("assistantId", {
    defaultValue: process.env.NEXT_PUBLIC_ASSISTANT_ID || "",
  });
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const finalApiUrl = apiUrl || envApiUrl;
  const finalAssistantId = assistantId?.trim();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  // Use ref to avoid getThreads in deps (its identity changes when session refreshes)
  const getThreadsRef = useRef(getThreads);
  getThreadsRef.current = getThreads;

  // Load threads when apiUrl, assistantId, or userId become available
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!finalApiUrl || !finalAssistantId) return;
    if (!userId) return;

    setThreadsLoading(true);
    getThreadsRef.current()
      .then(setThreads)
      .catch((error) => {
        console.error(error);
        setThreads([]); // Set empty array on error to show clean empty state
      })
      .finally(() => setThreadsLoading(false));
  }, [
    finalApiUrl,
    finalAssistantId,
    userId,
    setThreads,
    setThreadsLoading,
  ]);

  const handleNewChat = () => {
    setThreadId(null);
  };

  const handleToggleChatHistory = () => {
    setChatHistoryOpen((p) => !p);
  };

  const handleMobileNewChat = () => {
    handleNewChat();
    setChatHistoryOpen(false);
  };

  const handleMobileThreadClick = () => {
    setChatHistoryOpen((o) => !o);
  };

  return (
    <>
      <DesktopSidebar
        threads={threads}
        threadsLoading={threadsLoading}
        chatHistoryOpen={chatHistoryOpen}
        onToggleChatHistory={handleToggleChatHistory}
        onNewChat={handleNewChat}
        onShowGuide={onShowGuide}
      />
      <MobileSidebar
        threads={threads}
        isOpen={!!chatHistoryOpen && !isLargeScreen}
        onOpenChange={(open) => {
          if (isLargeScreen) return;
          setChatHistoryOpen(open);
        }}
        onNewChat={handleMobileNewChat}
        onThreadClick={handleMobileThreadClick}
        onShowGuide={onShowGuide}
      />
    </>
  );
}
