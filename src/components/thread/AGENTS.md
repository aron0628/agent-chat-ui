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

## State Machine

`index.tsx`의 상태 관리는 다음 주요 변수들로 구성된 암시적 상태 머신:

### Key State Variables
| Variable | Scope | Purpose |
|----------|-------|---------|
| `threadId` | URL (nuqs) | 현재 스레드 ID - `null`이면 새 채팅 |
| `input` | Local state | 텍스트 입력 버퍼 |
| `contentBlocks` | Local state | 업로드된 파일(이미지/PDF) 블록 |
| `firstTokenReceived` | Local state | AI 응답 첫 토큰 수신 여부 (스켈레톤 표시 제어) |
| `chatHistoryOpen` | URL (nuqs) | 좌측 히스토리 사이드바 표시 여부 |
| `hideToolCalls` | URL (nuqs) | 도구 호출 결과 숨김 여부 |
| `fullDescriptionOpen` | Local state | 앱 상세 설명 모달 표시 여부 |
| `messages` | Stream context | LangGraph 서버에서 수신한 메시지 리스트 |
| `isLoading` | Stream context | 스트리밍 진행 중 플래그 |

### State Transitions

1. **새 채팅 시작** (`chatStarted=false`)
   - `chatStarted = !!threadId || !!messages.length`으로 결정
   - Assistant 선택 후 메시지 입력 가능
   - Assistant 변경 시: `threadId`, `input`, `contentBlocks`, `firstTokenReceived` 초기화

2. **메시지 제출** (`handleSubmit`)
   - `firstTokenReceived` → `false` 설정 (스켈레톤 재표시)
   - 낙관적 업데이트: `optimisticValues` 콜백으로 즉시 UI에 표시
   - `stream.submit()` 호출 후 `input`, `contentBlocks` 초기화
   - `ensureToolCallsHaveResponses()`로 tool_call 메시지 자동 응답 추가

3. **첫 토큰 대기** (`firstTokenReceived=false` + `isLoading=true`)
   - AssistantMessageLoading 스켈레톤 표시
   - 새 AI 메시지가 도착하면 `firstTokenReceived=true` 전환

4. **스트리밍 진행** (`firstTokenReceived=true`)
   - AssistantMessage로 AI 응답 렌더링
   - 마크다운, 도구 호출, 커스텀 UI 컴포넌트 처리

5. **재생성** (`handleRegenerate`)
   - `prevMessageLength.current - 1`로 감소 (firstTokenReceived 트릭)
   - 마지막 AI 메시지를 재생성 위해 체크포인트 지정

## Edge Cases & Gotchas

### firstTokenReceived 트릭
- `handleRegenerate`에서 `prevMessageLength.current -= 1`로 감소하는 이유: useEffect가 메시지 개수 변화를 감지하여 `firstTokenReceived=true`로 설정하기 때문. 다시 false로 만들기 위해 카운터를 속인다.

### ChatOpeners 비동기 패턴
```typescript
onSelectOpener={(opener) => {
  setInput(opener);  // 상태 업데이트
  setTimeout(() => {
    const form = document.querySelector('form');
    form?.requestSubmit();  // 다음 이벤트 루프에서 실행
  }, 0);
}}
```
- `setTimeout(..., 0)`으로 React 상태 업데이트 후 폼 제출
- `requestSubmit()` 사용 (DOM submit() 아님) - onSubmit 핸들러 호출

### ToolMessages 생성
- `ensureToolCallsHaveResponses()`는 tool_call 후 응답이 없으면 synthetic ToolMessage 생성
- ID에 `"do-not-render-"` 프리픽스 추가
- 서버에는 전송되지만 UI에서 필터링되어 표시 안됨

### 에러 중복 제거
- `lastError` ref로 이전 에러 메시지 추적
- 동일 메시지는 토스트 반복 표시 안함

### 레이아웃 상수
- 좌측 히스토리 사이드바 너비: `UI.CHAT_SIDEBAR_WIDTH = 300px`
- 텍스트 입력 최대 높이: `UI.CHAT_TEXTAREA_MAX_HEIGHT = 490px`

### 설정 기본값 변동
- `chatHistoryOpen`의 기본값은 배포 설정에 따라 결정: `config.threads.sidebarOpenByDefault`

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
