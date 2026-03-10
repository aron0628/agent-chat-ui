<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# agent-inbox

## Purpose
LangGraph Human-in-the-loop (HITL) 인터럽트 처리 UI. 에이전트가 사용자 확인을 요청할 때 표시되는 인터럽트 뷰로, 액션 승인(accept), 편집(edit), 응답(respond), 무시(ignore) 기능을 제공한다.

## Key Files

| File | Description |
|------|-------------|
| `index.tsx` | `ThreadView` - 인터럽트 메인 컴포넌트. 상태 뷰와 액션 뷰 토글 |
| `types.ts` | 타입 정의 - `HumanResponseWithEdits`, `ThreadData`, `Email`, `AgentInbox`, `SubmitType` 등 |
| `utils.ts` | 인터럽트 관련 유틸리티 함수 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | 인터럽트 UI 하위 컴포넌트 |
| `hooks/` | 인터럽트 액션 처리 커스텀 훅 |

## Key Subcomponents

| File | Description |
|------|-------------|
| `components/thread-actions-view.tsx` | 인터럽트 액션 뷰 - accept/edit/respond/ignore 버튼 |
| `components/state-view.tsx` | 스레드 상태 JSON 뷰어 |
| `components/inbox-item-input.tsx` | 인터럽트 응답 입력 폼 |
| `components/thread-id.tsx` | 스레드 ID 표시 |
| `components/tool-call-table.tsx` | 도구 호출 정보 테이블 |
| `hooks/use-interrupted-actions.tsx` | `useInterruptedActions()` - 인터럽트 응답 제출 로직 |

## For AI Agents

### Working In This Directory
- `HumanInterrupt` 타입은 `@langchain/langgraph/prebuilt`에서 import
- 인터럽트 스키마 검증: `isAgentInboxInterruptSchema()` (lib/agent-inbox-interrupt.ts)
- 인터럽트 config 필드: `allow_accept`, `allow_edit`, `allow_respond`, `allow_ignore`
- 상태 뷰와 액션 뷰는 토글 방식 (동시 표시 불가)

### Interrupt Flow
```
LangGraph Server → interrupt event → stream.interrupt
  → isAgentInboxInterruptSchema() 검사
  → true: ThreadView (agent-inbox) 렌더링
  → false: GenericInterruptView (JSON 뷰어) 렌더링
```

## Dependencies

### Internal
- `src/hooks/useStreamContext` - 스트리밍 상태
- `../utils.ts` - 유틸리티

### External
- `@langchain/langgraph/prebuilt` - `HumanInterrupt`, `HumanResponse`
- `@langchain/langgraph-sdk` - `Thread`, `ThreadStatus`
- `@langchain/core/messages` - `BaseMessage`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
