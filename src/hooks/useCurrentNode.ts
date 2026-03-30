import { useContext } from "react";
import { CurrentNodeContext } from "@/providers/Stream";

const NODE_LABELS: Record<string, string> = {
  summarize_conversation: "대화 요약 중",
  pre_retrieve: "문서 검색 중",
  call_model: "AI 응답 생성 중",
  tools: "도구 실행 중",
};

export function useCurrentNode() {
  const currentNode = useContext(CurrentNodeContext);
  const label = currentNode ? (NODE_LABELS[currentNode] ?? currentNode) : null;
  return { currentNode, label };
}
