<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# src

## Purpose
애플리케이션의 전체 소스 코드. Next.js App Router 구조를 따르며, React Context Provider 패턴으로 전역 상태를 관리하고, LangGraph SDK를 통해 AI 에이전트와 실시간 스트리밍 대화를 구현한다.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router 페이지 및 API 라우트 (see `app/AGENTS.md`) |
| `components/` | React 컴포넌트 - UI 프리미티브, 채팅 스레드, 설정 (see `components/AGENTS.md`) |
| `hooks/` | 커스텀 React 훅 - 설정, 스트림, 스레드, 미디어쿼리 (see `hooks/AGENTS.md`) |
| `lib/` | 유틸리티, 설정 로더, API 헬퍼, 상수 (see `lib/AGENTS.md`) |
| `providers/` | React Context Provider - Settings, Thread, Stream, AssistantConfig (see `providers/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 경로 별칭 `@/` → `src/` (tsconfig.json에서 설정)
- 컴포넌트는 `components/` 아래에, 비즈니스 로직은 `lib/`에, 상태 관리는 `providers/`에 배치
- 새로운 전역 상태가 필요하면 `providers/`에 Context Provider 추가
- 새로운 훅이 필요하면 `hooks/`에 추가

### Component Architecture
```
providers/Settings → providers/Thread → providers/Stream
                                                ↓
                           components/thread/index.tsx (메인 채팅 UI)
                           ├── thread/history/ (사이드바)
                           ├── thread/messages/ (메시지 렌더링)
                           ├── thread/agent-inbox/ (인터럽트 처리)
                           └── settings/ (연결/설정 다이얼로그)
```

## Dependencies

### Internal
- 모든 하위 디렉토리는 상호 참조 관계

### External
- `@langchain/langgraph-sdk` - LangGraph 서버 클라이언트
- `@langchain/langgraph` - useStream 훅
- `react` 19.x + `next` 15.x

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
