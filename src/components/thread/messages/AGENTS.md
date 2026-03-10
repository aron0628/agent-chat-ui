<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# messages

## Purpose
메시지 타입별 렌더링 컴포넌트. AI 메시지, Human 메시지, Tool Call/Result, 인터럽트 뷰를 담당한다.

## Key Files

| File | Description |
|------|-------------|
| `ai.tsx` | `AssistantMessage` - AI 응답 렌더링 (마크다운 + 도구호출 + 커스텀UI + 인터럽트). `AssistantMessageLoading` - 타이핑 인디케이터 |
| `human.tsx` | `HumanMessage` - 사용자 메시지 렌더링 (텍스트 + 멀티모달 미리보기). 인라인 편집 지원 (`EditableContent`) |
| `tool-calls.tsx` | `ToolCalls` - 도구 호출 아코디언 UI. `ToolResult` - 도구 실행 결과 렌더링 |
| `shared.tsx` | `BranchSwitcher` - 메시지 브랜치 탐색 (이전/다음). `CommandBar` - 복사, 편집, 재생성 버튼 |
| `generic-interrupt.tsx` | `GenericInterruptView` - 비-AgentInbox 인터럽트의 JSON 뷰어 |

## For AI Agents

### Working In This Directory
- 각 메시지 타입은 독립 컴포넌트: `ai.tsx`(AI/tool), `human.tsx`(human)
- `shared.tsx`의 `BranchSwitcher`와 `CommandBar`는 양쪽 메시지 타입에서 공유
- AI 메시지 렌더링 순서: 텍스트 → ToolCalls → CustomComponent → Interrupt → CommandBar
- `hideToolCalls` URL 파라미터로 도구 호출 표시/숨김 토글
- Anthropic 스트리밍 형식의 tool_use 콘텐츠를 `parseAnthropicStreamedToolCalls`로 변환
- `thread.getMessagesMetadata()`로 브랜치 정보, 첫 등장 상태 접근

### Component Hierarchy
```
AssistantMessage
├── ToolResult (type === "tool")
├── MarkdownText (텍스트 콘텐츠)
├── ToolCalls (도구 호출 아코디언)
├── CustomComponent (UI 메시지)
├── Interrupt (AgentInbox 또는 Generic)
├── BranchSwitcher
└── CommandBar (복사, 재생성)

HumanMessage
├── MultimodalPreview (이미지/PDF)
├── EditableContent (편집 모드)
├── BranchSwitcher
└── CommandBar (복사, 편집)
```

## Dependencies

### Internal
- `../utils.ts` - `getContentString()`
- `../markdown-text.tsx` - `MarkdownText`
- `../artifact.tsx` - `useArtifact()`
- `../agent-inbox/` - `ThreadView`
- `../MultimodalPreview.tsx`
- `src/hooks/useStreamContext`
- `src/lib/agent-inbox-interrupt.ts`
- `src/lib/multimodal-utils.ts`

### External
- `@langchain/langgraph-sdk` - Message, AIMessage, Checkpoint
- `@langchain/core/output_parsers` - parsePartialJson
- `@langchain/langgraph-sdk/react-ui` - LoadExternalComponent
- `nuqs` - hideToolCalls 상태

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
