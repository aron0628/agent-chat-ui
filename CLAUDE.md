# Agent Chat UI - Claude Code Instructions

## Project Overview

LangGraph 기반 AI 에이전트와 대화하기 위한 Next.js 웹 채팅 UI. LangChain의 오픈소스 프로젝트를 포크하여 한국어 커스터마이징("MobileFactory Chat")이 적용된 버전.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript 5.7 (strict mode)
- **Package Manager**: pnpm 10.5.1 (npm/yarn 사용 금지)
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york 스타일)
- **State**: React Context + nuqs (URL query params) + localStorage
- **AI SDK**: @langchain/langgraph-sdk (useStream SSE 스트리밍)
- **UI Primitives**: Radix UI + lucide-react 아이콘
- **Animation**: Framer Motion
- **Markdown**: react-markdown + remark-gfm + rehype-katex + react-syntax-highlighter

## Commands

```bash
pnpm dev          # 개발 서버 시작
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 시작
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier 포맷팅
pnpm format:check # Prettier 포맷 검사
make dev          # 의존성 자동 설치 + 개발 서버
make clean        # node_modules + .next 삭제
```

## Architecture

### Provider Hierarchy (순서 중요)
```
SettingsProvider        ← YAML 설정 + localStorage 사용자 설정
  └── ThreadProvider    ← 스레드 목록 (LangGraph API)
        └── StreamProvider    ← 스트리밍 연결
              └── StreamSession   ← useStream 실행
                    └── AssistantConfigProvider  ← 어시스턴트 설정/스키마
                          └── ArtifactProvider   ← 아티팩트 사이드 패널 상태
```

### Key Data Flows
- **설정 로딩**: `page.tsx`(서버) → `loadServerConfig()` → `ClientApp`으로 전달 → `SettingsProvider` 초기화
- **스트리밍**: `StreamSession` → `useStream` SSE → `stream.messages` → Thread 컴포넌트 렌더링
- **API 프록시**: 브라우저 → `api/[..._path]/route.ts` (Edge Runtime) → `langgraph-nextjs-api-passthrough` → LangGraph 서버
- **URL 상태**: `normalizeApiUrl()`이 상대 경로(예: `/api`)도 지원 → `window.location.origin` 자동 접두
- **Assistant 해석**: UUID → `assistant_id`로 검색, 비-UUID(예: `"agent"`) → `graph_id`로 검색

### Directory Structure
```
src/
├── app/              # Next.js App Router (page.tsx, layout.tsx, API proxy)
├── components/
│   ├── thread/       # 메인 채팅 UI (index.tsx = 700줄 핵심 컴포넌트)
│   │   ├── messages/ # AI/Human/Tool 메시지 렌더링
│   │   ├── agent-inbox/ # HITL 인터럽트 처리
│   │   └── history/  # 채팅 히스토리 사이드바
│   ├── settings/     # 연결/설정 다이얼로그
│   ├── ui/           # shadcn/ui 프리미티브
│   └── icons/        # 커스텀 SVG 아이콘
├── hooks/            # Context 접근 훅 + useFileUpload, useMediaQuery
├── lib/              # 유틸리티, 설정 로더, API 헬퍼, 상수
├── providers/        # React Context Provider (Settings, Thread, Stream, AssistantConfig)
public/
├── settings.yaml     # 메인 앱 설정 (chat-config.yaml 폴백)
├── chat-openers.yaml # 채팅 추천 질문
└── full-description.md # 앱 상세 설명
```

## Configuration System

설정 로드 순서: `settings.yaml` → `chat-config.yaml` → `defaultConfig`
- 서버: `config-server.ts` (Node.js fs로 읽기)
- 클라이언트: `config.ts` (fetch로 읽기)
- `chat-openers.yaml`은 별도 로드 후 `branding.chatOpeners`에 병합
- 스키마: `src/lib/config.ts`의 `ChatConfig` 인터페이스 참조
- **주의**: YAML 파싱 후 런타임 검증 없음 (Zod 미적용) - 잘못된 값이 `mergeConfig()`를 통과함
- `config.ts` 수정 시 `config-server.ts`도 반드시 동기화 (동일 `ChatConfig` 스키마 사용)

## Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Client | LangGraph 서버 URL (기본: `http://localhost:2024`) |
| `NEXT_PUBLIC_ASSISTANT_ID` | Client | 어시스턴트 ID (기본: `agent`) |
| `NEXT_PUBLIC_LANGCHAIN_API_KEY` | Client | LangGraph API 키 폴백 (`Stream.tsx`에서 localStorage 키 없을 때 사용) |
| `LANGSMITH_API_KEY` | Server | LangSmith API 키 (프록시 인증) |
| `LANGGRAPH_API_URL` | Server | LangGraph 배포 URL (프로덕션) |

## Coding Conventions

### General
- 경로 별칭: `@/` → `src/`
- `cn()` 유틸리티로 Tailwind 클래스 병합 (`clsx` + `tailwind-merge`)
- shadcn/ui 컴포넌트 추가: `npx shadcn@latest add <component>`
- 한국어 UI 텍스트 사용 (상수 파일 또는 인라인)

### State Management
- 전역 상태: React Context Provider (`src/providers/`)
- Context 접근: 반드시 `src/hooks/`의 커스텀 훅 사용 (직접 useContext 호출 지양)
- URL 상태: `nuqs`의 `useQueryState` (threadId, apiUrl, assistantId, chatHistoryOpen, hideToolCalls)
- **주의**: `nuqs` 파라미터 정의가 10+ 파일에 분산되어 있음 - 동일 키의 기본값이 파일마다 다를 수 있음
- API 키: localStorage `lg:chat:apiKey` (폴백: `NEXT_PUBLIC_LANGCHAIN_API_KEY` 환경변수)
- 사용자 설정: localStorage `agent-chat-user-settings`

### Component Patterns
- 메시지 렌더링: `DO_NOT_RENDER_ID_PREFIX`로 시작하는 ID는 UI에서 숨김
- 스트리밍 제출: `stream.submit()` + `optimisticValues` 콜백으로 낙관적 업데이트
- 인터럽트: `isAgentInboxInterruptSchema()`로 타입 분기 → ThreadView 또는 GenericInterruptView
- 반응형: 1024px 기준 데스크톱/모바일 분기 (`useMediaQuery`)
- Enter로 전송, Shift+Enter로 줄바꿈, IME 조합 중 전송 방지

### File Naming
- 컴포넌트: PascalCase (`AssistantSelector.tsx`)
- 훅: `useXxx.ts` (단순) 또는 `use-xxx.tsx` (JSX 포함)
- 유틸리티: kebab-case (`file-validation.ts`)

## CI/CD

GitHub Actions (`ci.yml`):
- `pnpm format:check` - Prettier 포맷 검사
- `pnpm lint` - ESLint 검사
- codespell - README.md + src/ 맞춤법 검사
- Node 18.x, pnpm 10.5.1

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@langchain/langgraph-sdk` | LangGraph 서버 클라이언트 + `useStream` 훅 + `uiMessageReducer` |
| `@langchain/langgraph` | LangGraph 프리빌트 타입 (HumanInterrupt 등) |
| `@langchain/core` | LangChain 코어 타입 (Base64ContentBlock 등) |
| `langgraph-nextjs-api-passthrough` | Next.js API 프록시 |
| `nuqs` | URL 쿼리 파라미터 상태 관리 |
| `use-stick-to-bottom` | 채팅 자동 스크롤 |
| `js-yaml` | YAML 설정 파싱 |
| `sonner` | 토스트 알림 |
| `next-themes` | sonner.tsx에서만 사용 (ThemeProvider 없음 - 사실상 미작동) |
| `class-variance-authority` | shadcn/ui 컴포넌트 variant 정의 |
| `date-fns` | 스레드 히스토리 날짜 포맷 |

## Gotchas

### 타입 & 설정
- `settings.yaml` 수정 시 `ChatConfig` 인터페이스와 일치해야 함 (config.ts + config-server.ts 동기화)
- `UserSettings.fontFamily`에 `"pretendard"` 옵션이 있지만 `ChatConfig.theme.fontFamily` 타입에는 없음 (런타임 검증 없이 통과)
- `settings.yaml`에 Zod 런타임 검증 미적용 - 잘못된 YAML 값이 무시 없이 전파됨

### 컴포넌트 & UI
- `thread/index.tsx`가 700줄 이상 - 대형 컴포넌트이므로 수정 시 주의
- `dropdown-menu.tsx`는 커스텀 구현 (Radix 미사용) - 키보드 네비게이션 미지원
- `sonner.tsx`가 `next-themes`의 `useTheme`을 사용하지만 ThemeProvider가 없음 - 토스트 테마가 항상 "system"으로 감지됨

### 스타일링
- Tailwind CSS v4 사용 - `@import "tailwindcss"`, `@plugin`, `@theme inline`, `@custom-variant` 문법
- 다크모드: `next-themes` 아닌 `Settings.tsx`에서 `document.documentElement.classList.toggle("dark")` 수동 적용
- 다크모드 auto 모드: 시스템 환경설정 변경 시 실시간 반영 안됨 (초기 로드 시 1회만 확인)
- `globals.css`에 차트 CSS 변수 중복 정의 (oklch가 @layer base의 HSL에 의해 덮어씌워짐)
- 테마 적용: CSS 변수 `--font-family`, `--base-font-size`를 `:root`에 직접 설정

### 런타임 & 네트워크
- API 프록시 (`api/[..._path]/route.ts`)는 Edge Runtime - Node.js API 사용 불가
- API 프록시 환경변수 미설정 시 기본값 `"remove-me"`로 혼란스러운 에러 발생
- `Stream.tsx` 헬스체크: 마운트 시 `{apiUrl}/info` 호출, 실패 시 10초 토스트
- 새 스레드 생성 후 4초 딜레이 (`TIMING.THREAD_FETCH_DELAY`) - LangGraph API 일관성 대기
- `ensureToolCallsHaveResponses()`가 생성하는 합성 ToolMessage는 LangGraph 서버에 실제 전송됨

### 의존성
- `esbuild`, `esbuild-plugin-tailwindcss`가 devDependencies가 아닌 dependencies에 위치
- `react-is`가 React 19 RC 버전으로 override됨 (`package.json`)
- `recharts`, `zod`는 직접 import 없이 dependencies에 존재 (미사용 가능성)
- `next-themes`는 `sonner.tsx`에서만 사용되며 ThemeProvider 없음

### 코드 품질
- `Stream.tsx`, `AssistantConfig.tsx`, `config.ts`에 `console.log`가 NODE_ENV 체크 없이 존재
- 토스트 메시지가 한국어/영어 혼용 (i18n 시스템 미구현)
- `nuqs` URL 파라미터 정의가 10+ 파일에 분산 (중앙화된 정의 없음)
- `lib/assistant-api.ts`가 `providers/client.ts`에서 import - 역방향 의존성 (lib → providers)
