<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# hooks

## Purpose
커스텀 React 훅 모듈. Context Provider 접근용 래퍼 훅과 파일 업로드, 미디어쿼리 등 재사용 가능한 UI 훅을 제공한다.

## Key Files

| File | Description |
|------|-------------|
| `useSettings.ts` | `useSettings()` - SettingsContext 접근 훅 (ChatConfig + UserSettings) |
| `useStreamContext.ts` | `useStreamContext()` - StreamContext 접근 훅 (LangGraph 스트리밍 상태) |
| `useThreads.ts` | `useThreads()` - ThreadContext 접근 훅 (스레드 목록 관리) |
| `useAssistantConfig.ts` | `useAssistantConfig()` - AssistantConfigContext 접근 훅 (어시스턴트 설정/스키마) |
| `use-file-upload.tsx` | `useFileUpload()` - 파일 업로드 훅. 드래그&드롭, 붙여넣기, 파일 선택 지원. Base64 변환 |
| `useMediaQuery.tsx` | `useMediaQuery()` - CSS 미디어쿼리 매칭 훅 (반응형 UI용) |

## For AI Agents

### Working In This Directory
- Context 접근 훅은 모두 같은 패턴: `useContext()` + undefined 체크 + throw Error
- 새로운 Provider 추가 시 대응하는 접근 훅을 이 디렉토리에 생성
- `use-file-upload.tsx`는 유일하게 복잡한 훅 - 글로벌 drag 이벤트 리스너 관리
- 파일명 컨벤션: `useXxx.ts` (단순 훅), `use-xxx.tsx` (JSX 포함 훅)

### Hook → Provider Mapping
| Hook | Provider | Context |
|------|----------|---------|
| `useSettings` | `SettingsProvider` | config, userSettings, updateUserSettings |
| `useStreamContext` | `StreamProvider` | useStream 반환값 전체 |
| `useThreads` | `ThreadProvider` | getThreads, threads, setThreads |
| `useAssistantConfig` | `AssistantConfigProvider` | config, schemas, updateConfig |

## Dependencies

### Internal
- `src/providers/` - 모든 Context 정의
- `src/lib/file-validation.ts` - `processFiles()` (use-file-upload에서 사용)
- `src/lib/multimodal-utils.ts` - `fileToContentBlock()` 간접 의존

### External
- `@langchain/core/messages` - `Base64ContentBlock` 타입

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
