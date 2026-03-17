<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# lib

## Purpose
유틸리티 함수, 설정 로더, API 헬퍼, 타입 정의, 상수를 모아둔 라이브러리 디렉토리. 컴포넌트와 프로바이더에서 공통으로 사용하는 비-UI 로직을 담당한다.

## Key Files

| File | Description |
|------|-------------|
| `config.ts` | `ChatConfig` 인터페이스 + `defaultConfig` + 클라이언트 사이드 YAML 설정 로더 (`loadConfig()`, `mergeConfig()`) |
| `config-server.ts` | 서버 사이드 YAML 설정 로더 (`loadServerConfig()`) - Node.js fs 사용 |
| `assistant-api.ts` | LangGraph 어시스턴트 API 래퍼 - CRUD 함수 (`getAssistant`, `searchAssistants`, `updateAssistantConfig`, `getAssistantSchemas`) |
| `api-key.tsx` | `getApiKey()` - localStorage에서 API 키 읽기 (`lg:chat:apiKey`) |
| `constants.ts` | 전역 상수 - UI 레이아웃 (`CHAT_SIDEBAR_WIDTH`, `CHAT_TEXTAREA_MAX_HEIGHT`), 타이밍 (`THREAD_FETCH_DELAY`), 플레이스홀더 |
| `utils.ts` | `cn()` - Tailwind CSS 클래스 병합 유틸리티 (`clsx` + `tailwind-merge`) |
| `file-validation.ts` | 파일 업로드 검증 - 지원 타입 체크, 중복 감지, 에러 토스트 (`processFiles()`) |
| `multimodal-utils.ts` | `fileToContentBlock()` - File→Base64 변환, `isBase64ContentBlock()` 타입 가드 |
| `ensure-tool-responses.ts` | `ensureToolCallsHaveResponses()` - AI 메시지의 tool_call에 대한 응답 메시지 자동 생성 (바로 다음 메시지만 선형 스캔, tool_call_id 상관관계 없음) |
| `agent-inbox-interrupt.ts` | `isAgentInboxInterruptSchema()` - LangGraph `HumanInterrupt` 스키마 검증 타입 가드 |

## For AI Agents

### Working In This Directory
- 설정 로더가 2개: `config.ts` (클라이언트, fetch 사용), `config-server.ts` (서버, fs 사용)
- `config.ts` 수정 시 `config-server.ts`도 동기화 필요 (동일 `ChatConfig` 스키마)
- `assistant-api.ts`는 `providers/client.ts`의 `createClient()`를 사용 - **역의존성 주의** (lib → providers, 의도된 레이어링 위반)
- `config.ts`에 `console.log`가 있음 (chat opener 개수 출력) - NODE_ENV 체크 없음
- YAML 파싱된 설정에 런타임 검증(Zod) 없음 (zod가 의존성에 있으나 미사용)
- `utils.ts`의 `cn()` 함수는 모든 컴포넌트에서 사용되는 핵심 유틸리티
- 파일 업로드 관련: `file-validation.ts` → `multimodal-utils.ts` 순서로 의존

### Configuration Loading Flow
```
Server Side:  config-server.ts → fs.readFile → public/settings.yaml → mergeConfig()
Client Side:  config.ts → fetch("/settings.yaml") → mergeConfig()
Both:         chat-openers.yaml 별도 로드 후 branding.chatOpeners에 병합
Fallback:     settings.yaml → chat-config.yaml → defaultConfig
```

### ensure-tool-responses 세부사항
- 바로 다음 메시지만 검사 (선형 스캔, tool_call_id와의 상관관계 없음)
- 합성 메시지: `"do-not-render-"` ID 접두사 + 하드코딩된 내용 `"Successfully handled tool call."`
- 이 합성 메시지는 LangGraph 서버로 실제 메시지처럼 전송됨

### File Upload Pipeline
```
File Input/Drop/Paste
  → file-validation.ts: validateFiles() (타입 체크, 중복 감지)
  → file-validation.ts: showFileValidationErrors() (토스트 에러)
  → multimodal-utils.ts: fileToContentBlock() (Base64 변환)
  → Base64ContentBlock[] 반환
```

**Notable Details:**
- 이미지는 메타데이터 키 `name` 사용, PDF는 `filename` 사용 - 불일치 네이밍

## Dependencies

### Internal
- `src/providers/client.ts` - `createClient()` (assistant-api.ts에서 사용)

### External
- `js-yaml` - YAML 파싱
- `@langchain/core/messages` - `Base64ContentBlock` 타입
- `@langchain/langgraph-sdk` - `Message`, `ToolMessage` 타입
- `@langchain/langgraph/prebuilt` - `HumanInterrupt` 타입
- `uuid` - UUID 생성 (`ensure-tool-responses.ts`)
- `clsx` + `tailwind-merge` - CSS 클래스 유틸리티
- `sonner` - 토스트 알림
- `zod` - (의존성에 있으나 현재 직접 사용 없음)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
