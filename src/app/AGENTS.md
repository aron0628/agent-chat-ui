<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# app

## Purpose
Next.js App Router 디렉토리. 서버 사이드 설정 로딩, 클라이언트 앱 초기화, LangGraph API 프록시를 담당한다.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | 루트 페이지 - 서버 사이드에서 `loadServerConfig()` 호출 후 `ClientApp`에 전달 |
| `ClientApp.tsx` | 클라이언트 컴포넌트 - Provider 계층 구성 (Settings → Thread → Stream → Artifact → Thread UI) |
| `layout.tsx` | 루트 레이아웃 - HTML 구조, `NuqsAdapter` (URL 상태 관리) 래핑. `suppressHydrationWarning` on `<html>` and `<body>` for dark mode class applied client-side |
| `globals.css` | 전역 CSS - Tailwind CSS v4 import (`@import "tailwindcss"`), plugin loader (`@plugin "tailwindcss-animate"`), custom dark variant, `@theme inline` blocks for design tokens. Chart CSS variables defined in oklch format (root) and HSL format (layer base) |
| `favicon.ico` | 파비콘 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/[..._path]/` | LangGraph API 프록시 catch-all 라우트 |

## For AI Agents

### Working In This Directory
- `page.tsx`는 서버 컴포넌트, `ClientApp.tsx`는 클라이언트 컴포넌트 (`"use client"`)
- 새로운 페이지 추가 시 Next.js App Router 컨벤션 준수
- Provider 순서가 중요: Settings → Thread → Stream → Artifact (의존성 순서)
- API 프록시는 `langgraph-nextjs-api-passthrough` 패키지가 자동 처리
- `layout.tsx`: `suppressHydrationWarning` on both `<html>` and `<body>` elements to prevent hydration errors when dark mode class is applied client-side
- `NuqsAdapter` from `nuqs/adapters/next/app` wraps entire app to enable URL-based state management (threadId, apiUrl, assistantId, etc.)

### API Proxy (`api/[..._path]/route.ts`)
- `initApiPassthrough()`로 모든 HTTP 메서드 (GET, POST, PUT, PATCH, DELETE, OPTIONS) 프록시
- Edge Runtime 사용: Node.js APIs (fs, path 등) 사용 불가
- `LANGGRAPH_API_URL` → LangGraph 서버 URL
- `LANGSMITH_API_KEY` → 인증 키 (서버 사이드 전용)
- **Gotcha**: Lines 8-9 set default values `"remove-me"` when env vars aren't set. This produces confusing proxy errors instead of a clear "not configured" message. Ensure both env vars are properly set in production.

## Dependencies

### Internal
- `src/lib/config-server.ts` - 서버 사이드 설정 로더
- `src/lib/config.ts` - `ChatConfig` 타입
- `src/components/thread/` - 메인 Thread 컴포넌트
- `src/providers/` - 모든 Context Provider

### External
- `nuqs/adapters/next/app` - URL 쿼리 파라미터 상태 어댑터
- `langgraph-nextjs-api-passthrough` - API 프록시 유틸리티

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
