<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# agent-chat-ui

## Purpose
LangGraph 기반 AI 에이전트와 대화하기 위한 Next.js 웹 채팅 UI 애플리케이션. LangChain의 오픈소스 프로젝트를 기반으로 하며, LangGraph 서버에 대한 API 프록시를 통해 에이전트와 실시간 스트리밍 대화를 지원한다. 한국어 커스터마이징("MobileFactory Chat")이 적용된 포크 버전.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | pnpm 기반 프로젝트 의존성 및 스크립트 (dev, build, start, lint, format) |
| `next.config.mjs` | Next.js 설정 - Server Actions body size 10MB 제한 |
| `eslint.config.js` | ESLint flat config - Next.js + TypeScript 규칙 |
| `components.json` | shadcn/ui 설정 (new-york 스타일, lucide 아이콘) |
| `postcss.config.mjs` | PostCSS - Tailwind CSS v4 플러그인 |
| `prettier.config.js` | Prettier 설정 - Tailwind CSS 플러그인 포함 |
| `Makefile` | 개발 워크플로우 단축 명령어 (dev, run, install, clean) |
| `.env.example` | 환경변수 템플릿 (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_ASSISTANT_ID, LANGSMITH_API_KEY) |
| `.codespellignore` | 맞춤법 검사 제외 단어 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | 애플리케이션 소스 코드 (see `src/AGENTS.md`) |
| `public/` | 정적 자산 및 YAML 설정 파일 (see `public/AGENTS.md`) |
| `.github/` | CI 워크플로우 (see `.github/AGENTS.md`) |
| `assets/` | 프로젝트 문서용 이미지 (chat-interface.png) |

## Architecture Overview

```
[Browser] → [Next.js App (page.tsx)]
                ↓
        [ClientApp.tsx] ← Server-side config loading
                ↓
    [SettingsProvider] → YAML 기반 설정 관리
        [ThreadProvider] → 스레드 생명주기 관리
            [StreamProvider] → LangGraph 스트리밍 연결
                [ArtifactProvider] → 아티팩트 렌더링
                    [Thread Component] → 채팅 UI
```

### Data Flow
1. `page.tsx`에서 서버 사이드로 `settings.yaml` 로드
2. `ClientApp`에서 Provider 계층 구성 (Settings → Thread → Stream → Artifact)
3. `ArtifactProvider`는 `StreamProvider` 내부에서 `Thread`를 감싸고 있음 (최상위가 아님)
4. `StreamProvider`가 `@langchain/langgraph-sdk`를 통해 LangGraph 서버와 SSE 스트리밍
5. API 프록시(`src/app/api/[..._path]/route.ts`)가 `langgraph-nextjs-api-passthrough`로 LangGraph 서버 요청 중계
6. `normalizeApiUrl()` in `client.ts`는 상대 URL(예: `/api`)을 지원하여 동일 출처 배포 가능

## For AI Agents

### Working In This Directory
- 패키지 매니저는 **pnpm** (v10.5.1) - `npm`이나 `yarn` 사용 금지
- TypeScript strict mode 사용
- Tailwind CSS v4 사용 (v3 문법과 다름에 주의)
- shadcn/ui 컴포넌트 라이브러리 사용 (new-york 스타일)
- 경로 별칭: `@/` → `src/`

### Testing Requirements
- 테스트 프레임워크 미설정 (현재 lint + format 검사만 CI에서 실행)
- `pnpm lint` - ESLint 검사
- `pnpm format:check` - Prettier 포맷 검사
- `pnpm build` - 빌드 성공 여부 확인

### Common Patterns
- React Context Provider 패턴으로 전역 상태 관리 (Settings, Thread, Stream, Artifact)
- YAML 파일 기반 설정 시스템 (`settings.yaml`, `chat-config.yaml`, `chat-openers.yaml`)
- `nuqs` 라이브러리로 URL 쿼리 파라미터 기반 상태 관리 (threadId 등)
- `@langchain/langgraph-sdk`의 `useStream` 훅으로 SSE 스트리밍
- Framer Motion 애니메이션
- KaTeX 수학 수식 렌더링 지원
- `suppressHydrationWarning` 속성을 `html`, `body` 태그에 추가하여 다크모드 클래스 불일치 처리
- `DO_NOT_RENDER_ID_PREFIX` 패턴으로 합성 도구 메시지 UI에서 숨기기

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | LangGraph 서버 URL (기본: `http://localhost:2024`) | Yes |
| `NEXT_PUBLIC_ASSISTANT_ID` | LangGraph 어시스턴트 ID (기본: `agent`) | Yes |
| `NEXT_PUBLIC_LANGCHAIN_API_KEY` | LangGraph API 키 폴백 (Stream.tsx에서 사용, 미문서화) | No |
| `LANGSMITH_API_KEY` | LangSmith API 키 (프록시용, NEXT_PUBLIC_ 접두사 없음) | Production |
| `LANGGRAPH_API_URL` | LangGraph 배포 URL (프로덕션용) | Production |

## Dependencies

### External (Core)
- `next` 15.x - React 풀스택 프레임워크
- `react` 19.x - UI 라이브러리 (package.json에서 `react-is`를 RC 버전으로 오버라이드하여 React 19 호환성 확보)
- `@langchain/langgraph-sdk` - LangGraph 서버 클라이언트 SDK
- `@langchain/langgraph` - LangGraph useStream 훅
- `@langchain/core` - LangChain 코어 타입
- `langgraph-nextjs-api-passthrough` - Next.js API 프록시

### External (UI)
- `tailwindcss` 4.x - 유틸리티 CSS
- `@radix-ui/*` - 접근성 기반 헤드리스 UI 프리미티브
- `lucide-react` - 아이콘
- `framer-motion` - 애니메이션
- `sonner` - 토스트 알림
- `react-markdown` + `remark-gfm` + `rehype-katex` - 마크다운/수식 렌더링
- `react-syntax-highlighter` - 코드 구문 강조

## Known Issues & Gotchas

### Theme & Toast Issues
- `next-themes`은 `sonner.tsx`에서만 import되지만 `ThemeProvider`가 존재하지 않음 - 토스트 테마 감지가 작동하지 않음
- Dark mode auto-mode는 초기 로드 이후 시스템 설정 변경을 감지하지 않음
- `globals.css`의 차트 CSS 변수 중복: `@layer base`의 HSL 값이 `:root`의 oklch 값을 덮어씀 (lines 146-151 vs 30-34)

### Environment & Config Issues
- `NEXT_PUBLIC_LANGCHAIN_API_KEY`는 `Stream.tsx:165`에서 폴백 API 키로 사용되지만 문서화되지 않음
- `fontFamily: "pretendard"`는 `UserSettings` (src/providers/Settings.tsx:11)에는 있지만 `ChatConfig.theme` (src/lib/config.ts:25)에는 없음 - 타입 불일치
- `settings.yaml`은 런타임 검증이 없음 (Zod 스키마 미적용)

### Dependency Issues
- `esbuild`과 `esbuild-plugin-tailwindcss`는 `dependencies`에 있음 (should be `devDependencies`)
- `recharts`과 `zod`은 미사용 직접 의존성일 가능성 있음
- `react-is`는 React 19 호환성을 위해 RC 버전으로 오버라이드됨 (package.json overrides)

### Code Quality Issues
- `Stream.tsx`와 `AssistantConfig.tsx`의 console.log 문들이 NODE_ENV로 보호되지 않음
- Toast 메시지가 한국어와 영어를 혼재하며 i18n 시스템이 없음
- `nuqs` URL 파라미터 정의가 10개 이상의 파일에 분산되어 있음 (중앙 정의 없음)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
