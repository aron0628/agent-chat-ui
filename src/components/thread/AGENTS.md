<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# thread

## Purpose
메인 채팅 UI 컴포넌트 모듈. 메시지 렌더링, 입력 폼, 히스토리 사이드바, 에이전트 인박스(인터럽트 처리), 아티팩트 패널, 마크다운 렌더링 등 채팅 인터페이스의 모든 핵심 기능을 담당한다.

## Key Files

| File | Description |
|------|-------------|
| `index.tsx` | `Thread` 메인 컴포넌트 - 전체 채팅 레이아웃 (사이드바 + 채팅 + 아티팩트). 메시지 제출, 파일 업로드, 스트리밍 상태 관리 |
| `artifact.tsx` | `ArtifactProvider` + `useArtifact()` - 아티팩트(코드, 문서 등) 사이드 패널 상태 관리 |
| `markdown-text.tsx` | `MarkdownText` - react-markdown + GFM + KaTeX 수학 수식 + 구문 강조 마크다운 렌더링 |
| `syntax-highlighter.tsx` | `SyntaxHighlighter` - react-syntax-highlighter 래퍼 (코드 블록 렌더링) |
| `markdown-styles.css` | 마크다운 렌더링 CSS 스타일 |
| `utils.ts` | `getContentString()` - 멀티모달 메시지에서 텍스트 추출 유틸리티 |
| `tooltip-icon-button.tsx` | `TooltipIconButton` - 툴팁 포함 아이콘 버튼 래퍼 |
| `AssistantSelector.tsx` | `AssistantSelector` - 그래프/어시스턴트 선택 드롭다운 |
| `ChatOpeners.tsx` | `ChatOpeners` - 채팅 시작 시 표시되는 추천 질문 버튼 |
| `ContentBlocksPreview.tsx` | `ContentBlocksPreview` - 업로드된 파일(이미지/PDF) 미리보기 |
| `FullDescriptionModal.tsx` | `FullDescriptionModal` - 앱 상세 설명 마크다운 모달 |
| `MultimodalPreview.tsx` | `MultimodalPreview` - Base64 이미지/PDF 미리보기 컴포넌트 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `messages/` | 메시지 타입별 렌더링 컴포넌트 - AI, Human, Tool Call (see `messages/AGENTS.md`) |
| `agent-inbox/` | LangGraph Human-in-the-loop 인터럽트 처리 UI (see `agent-inbox/AGENTS.md`) |
| `history/` | 채팅 히스토리 사이드바 - 스레드 목록, CRUD (see `history/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `index.tsx`가 700줄 이상의 대형 컴포넌트 - 수정 시 주의
- URL 상태 관리: `nuqs`의 `useQueryState` 사용 (threadId, chatHistoryOpen, hideToolCalls, apiUrl, assistantId)
- 스트리밍: `useStreamContext()` → `stream.submit()`, `stream.stop()`, `stream.messages`
- `use-stick-to-bottom` 라이브러리로 자동 스크롤
- Enter로 전송, Shift+Enter로 줄바꿈, IME 조합 중 전송 방지 (`isComposing`)
- `ensureToolCallsHaveResponses()`로 tool_call 후 자동 응답 메시지 생성

### Message Rendering Flow
```
stream.messages → filter(DO_NOT_RENDER_ID_PREFIX) → map:
  human → HumanMessage (messages/human.tsx)
  ai/tool → AssistantMessage (messages/ai.tsx)
    ├── MarkdownText (텍스트)
    ├── ToolCalls (도구 호출)
    ├── CustomComponent (UI 메시지)
    └── Interrupt (agent-inbox 또는 generic)
```

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ ThreadHistory │ Chat Area         │ Artifact    │
│ (sidebar)     │ ┌─ Header ─────┐  │ (side panel)│
│               │ │ Logo + Nav   │  │             │
│               │ ├─ Messages ──┤  │             │
│               │ │ HumanMsg    │  │             │
│               │ │ AssistantMsg│  │             │
│               │ ├─ Input ─────┤  │             │
│               │ │ Textarea    │  │             │
│               │ │ FileUpload  │  │             │
│               │ └─────────────┘  │             │
└─────────────────────────────────────────────────┘
```

## Dependencies

### Internal
- `src/hooks/` - useStreamContext, useSettings, useAssistantConfig, useFileUpload, useMediaQuery
- `src/lib/` - utils, constants, ensure-tool-responses, agent-inbox-interrupt, multimodal-utils

### External
- `@langchain/langgraph-sdk` - Message, Checkpoint, AIMessage 타입
- `@langchain/langgraph-sdk/react-ui` - LoadExternalComponent
- `@langchain/core/messages` - Base64ContentBlock, MessageContentComplex
- `@langchain/core/output_parsers` - parsePartialJson
- `framer-motion` - 레이아웃 애니메이션
- `use-stick-to-bottom` - 자동 스크롤
- `nuqs` - URL 쿼리 파라미터 상태
- `react-markdown` + `remark-gfm` + `rehype-katex` + `remark-math` - 마크다운
- `react-syntax-highlighter` - 코드 구문 강조
- `lucide-react` - 아이콘

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
