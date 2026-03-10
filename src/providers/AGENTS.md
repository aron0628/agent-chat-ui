<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# providers

## Purpose
React Context Provider 모듈. 애플리케이션의 전역 상태를 관리하며, 설정(Settings), 스레드(Thread), 스트리밍(Stream), 어시스턴트 설정(AssistantConfig) 4개의 Provider로 구성된다.

## Key Files

| File | Description |
|------|-------------|
| `Settings.tsx` | `SettingsProvider` - YAML 설정 + localStorage 사용자 설정 관리. 테마(폰트, 색상, 다크모드) 적용 |
| `Thread.tsx` | `ThreadProvider` - 스레드 목록 조회/관리. `@langchain/langgraph-sdk` Client로 스레드 검색 |
| `Stream.tsx` | `StreamProvider` + `StreamSession` - LangGraph `useStream` 훅으로 SSE 스트리밍 연결. URL 파라미터/환경변수에서 apiUrl, assistantId, apiKey 결정 |
| `AssistantConfig.tsx` | `AssistantConfigProvider` - 어시스턴트 설정/스키마 조회 및 업데이트. UUID/graph_id 자동 해석 |
| `client.ts` | `createClient()` - LangGraph SDK Client 팩토리. `normalizeApiUrl()` 로 상대/절대 URL 처리 |

## Provider Hierarchy (순서 중요)

```
SettingsProvider          ← YAML 설정 + 사용자 테마
  └── ThreadProvider      ← 스레드 목록 (URL params 의존)
        └── StreamProvider    ← 스트리밍 연결 설정
              └── StreamSession   ← useStream 실행
                    └── AssistantConfigProvider  ← 어시스턴트 설정/스키마
```

## For AI Agents

### Working In This Directory
- Provider 추가 시 `ClientApp.tsx`에서 계층 순서 유지 필수
- 각 Provider의 Context 접근은 `src/hooks/`의 커스텀 훅 사용 (직접 useContext 호출 지양)
- `StreamProvider`는 `nuqs`의 `useQueryState`로 URL 쿼리 파라미터 관리 (apiUrl, assistantId, threadId)
- API 키는 localStorage (`lg:chat:apiKey`)에 저장

### State Flow
| Provider | State Source | Persistence |
|----------|-------------|-------------|
| Settings | YAML + localStorage | localStorage (`agent-chat-user-settings`) |
| Thread | LangGraph API | 메모리 (API 호출) |
| Stream | LangGraph useStream | URL params + localStorage |
| AssistantConfig | LangGraph API | 메모리 (API 호출) |

## Dependencies

### Internal
- `src/lib/config.ts` - `ChatConfig` 타입, `loadConfig()`, `defaultConfig`
- `src/lib/api-key.tsx` - `getApiKey()` localStorage 헬퍼
- `src/lib/assistant-api.ts` - 어시스턴트 API 함수
- `src/lib/constants.ts` - `TIMING` 상수
- `src/hooks/useThreads.ts` - ThreadContext 소비자 훅

### External
- `@langchain/langgraph-sdk` - `Client`, `useStream`, `Message`, `Thread` 타입
- `@langchain/langgraph-sdk/react-ui` - `UIMessage`, `uiMessageReducer`
- `nuqs` - URL 쿼리 파라미터 상태 관리
- `sonner` - 토스트 알림

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
