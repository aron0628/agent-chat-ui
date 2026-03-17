<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# providers

## Purpose
React Context Provider 모듈. 애플리케이션의 전역 상태를 관리하며, 설정(Settings), 스레드(Thread), 스트리밍(Stream), 어시스턴트 설정(AssistantConfig) 4개의 Provider로 구성된다.

## Key Files

| File | Description |
|------|-------------|
| `Settings.tsx` | `SettingsProvider` - YAML 설정 + localStorage 사용자 설정 관리. 테마(폰트, 색상, 다크모드) 적용. CSS 변수(`--font-family`, `--base-font-size`)로 스타일 적용 |
| `Thread.tsx` | `ThreadProvider` - 스레드 목록 조회/관리. `@langchain/langgraph-sdk` Client로 스레드 검색. UUID 검증으로 `assistant_id` 또는 `graph_id` 메타데이터 분기 |
| `Stream.tsx` | `StreamProvider` + `StreamSession` - LangGraph `useStream` 훅으로 SSE 스트리밍 연결. URL 파라미터/환경변수에서 apiUrl, assistantId, apiKey 결정. UI 메시지 처리 및 health check 포함 |
| `AssistantConfig.tsx` | `AssistantConfigProvider` - 어시스턴트 설정/스키마 조회 및 업데이트. UUID 검증 후 UUID→`assistant_id`, 비-UUID→`graph_id` 검색 전략 적용. 디버그 로깅 포함 |
| `client.ts` | `createClient()` - LangGraph SDK Client 팩토리. `normalizeApiUrl()`로 상대/절대 URL 처리 |

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

## Detailed Component Behavior

### Stream.tsx

**초기화 흐름:**
1. `StreamProvider`는 환경변수(`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ASSISTANT_ID`, `NEXT_PUBLIC_LANGCHAIN_API_KEY`)를 읽음
2. URL 쿼리 파라미터(`apiUrl`, `assistantId`)로 오버라이드 가능
3. API 키는 localStorage(`lg:chat:apiKey`)에서 로드하되, 저장된 키가 없고 env var가 있으면 env var 사용
4. `StreamSession`이 마운트될 때 `checkGraphStatus()`로 `{apiUrl}/info` 엔드포인트 health check → 실패 시 10초 토스트 표시

**메시지 처리:**
- `isUIMessage()` / `isRemoveUIMessage()` 이벤트를 감지하여 `uiMessageReducer`로 누적
- 커스텀 이벤트는 `handleCustomEvent` 콜백으로 처리되어 state mutate

**스레드 생성:**
- `onThreadId` 콜백에서 새 threadId 수신 후 `TIMING.THREAD_FETCH_DELAY` (4초) 대기 후 스레드 목록 재조회
- 4초 지연은 LangGraph API 최종 일관성(eventual consistency) 해결 위한 워크어라운드

**재연결:**
- 커스텀 재연결 로직 없음 - LangGraph SDK의 내부 SSE 재연결 메커니즘에 의존

**디버그 로깅:**
- `NODE_ENV` 체크 없이 모든 connection parameters 로깅 (apiUrl, apiKey 일부, assistantId 등)
- API 키는 처음 10자 이후 `...`로 마스킹되어 출력

### AssistantConfig.tsx

**UUID 해석 전략:**
- `initialAssistantId`가 UUID 형식인지 검증(`isValidUUID()`)
- **UUID인 경우:** `assistant_id` 필드로 직접 API 조회
- **UUID 아닌 경우:** `graph_id` 필드로 검색 후 반환된 첫 결과의 `assistant_id` 사용
- 검색 실패 시 에러 상태 설정

**스키마 및 어시스턴트 목록:**
- `fetchConfig()`에서 어시스턴트 상세 정보 및 스키마 조회
- `fetchAssistants()`에서 전체 어시스턴트 목록 조회 (limit: 50)

**디버그 로깅:**
- 모든 주요 단계에서 `[AssistantConfig]` 프리픽스 포함 로깅
- API 키는 처음 10자 마스킹

### Thread.tsx

**스레드 검색:**
- `getThreadSearchMetadata(assistantId)` 함수가 UUID 검증 결과에 따라 검색 메타데이터 분기
  - UUID → `{ assistant_id: assistantId }`
  - 비-UUID → `{ graph_id: assistantId }`
- 클라이언트의 `threads.search()` API에 메타데이터 전달

## Dependencies

### Internal
- `src/lib/config.ts` - `ChatConfig` 타입, `loadConfig()`, `defaultConfig`
- `src/lib/api-key.tsx` - `getApiKey()` localStorage 헬퍼
- `src/lib/assistant-api.ts` - 어시스턴트 API 함수, `isValidUUID()` 검증
- `src/lib/constants.ts` - `TIMING` 상수
- `src/hooks/useThreads.ts` - ThreadContext 소비자 훅

### External
- `@langchain/langgraph-sdk` - `Client`, `useStream`, `Message`, `Thread` 타입
- `@langchain/langgraph-sdk/react-ui` - `UIMessage`, `uiMessageReducer`
- `nuqs` - URL 쿼리 파라미터 상태 관리
- `sonner` - 토스트 알림
- `uuid` - UUID 검증

## Known Issues & Gotchas

### Environment Variables
- `NEXT_PUBLIC_LANGCHAIN_API_KEY` 환경변수는 `Stream.tsx:165`에서 API 키 폴백으로 읽혀지지만 문서화되지 않음
- CLAUDE.md의 환경변수 테이블에 `NEXT_PUBLIC_LANGCHAIN_API_KEY` 미포함 (누락된 항목)

### Debug Logging
- `Stream.tsx`에서 extensive `console.log` 디버그 로깅 발생: connection parameters, 부분 API 키 포함
- `NODE_ENV` 체크 없음 - production 환경에서도 로깅 출력
- `AssistantConfig.tsx`도 `[AssistantConfig]` 프리픽스와 함께 extensive 로깅 (API 키 마스킹됨)

### Health Check & Delays
- `StreamSession` 마운트 시 `checkGraphStatus()` 실행: `{apiUrl}/info` 엔드포인트 조회
- 연결 실패 시 10초 duration의 토스트 메시지 표시
- 새 스레드 생성 후 `TIMING.THREAD_FETCH_DELAY` = 4초 대기 - LangGraph API eventual consistency 해결용 워크어라운드

### Theme & Styling
- Settings.tsx에서 dark mode "auto" 옵션이 시스템 preference를 **한 번만** 읽음 (`window.matchMedia()`)
- 시스템 다크모드 변경 감지 리스너 미등록 - 브라우저 설정 변경 시 앱 재시작 필요
- Font/fontSize는 CSS 변수(`--font-family`, `--base-font-size`)로 `:root`에 적용

### Type Mismatches
- `UserSettings.fontFamily` 타입에 `"pretendard"` 포함 (`Settings.tsx:11`)
- 하지만 `ChatConfig.theme.fontFamily` 타입에는 `"pretendard"` 미포함 (`config.ts:25`)
- 타입 불일치로 인한 potential runtime 오류

### URL Handling
- `client.ts` `normalizeApiUrl()` 함수가 상대 URL 지원: 상대 경로 시 `window.location.origin` prepend
- 예: `"api"` → `"http://localhost:3000/api"` (클라이언트 환경에서)
- 서버 사이드 렌더링 시 `window` 미정의로 인한 오류 가능성

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
