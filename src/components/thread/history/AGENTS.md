<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# history

## Purpose
채팅 히스토리 사이드바 모듈. 스레드 목록 표시, 새 채팅 생성, 스레드 이름 편집/삭제, 데스크톱/모바일 반응형 사이드바를 담당한다.

## Key Files

| File | Description |
|------|-------------|
| `index.tsx` | `ThreadHistory` - 히스토리 메인 컴포넌트. 스레드 로드, 데스크톱/모바일 사이드바 분기 렌더링 |
| `constants.ts` | UI 상수 - 사이드바 너비, 스레드 제목 길이, 스크롤바 스타일, 한국어 UI 텍스트 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `components/` | 사이드바 UI 컴포넌트 |
| `hooks/` | 스레드 CRUD 커스텀 훅 |
| `utils/` | 스레드 헬퍼 유틸리티 |

## Key Subcomponents

| File | Description |
|------|-------------|
| `components/DesktopSidebar.tsx` | 데스크톱 사이드바 - 고정 패널, 토글 버튼 |
| `components/MobileSidebar.tsx` | 모바일 사이드바 - Sheet(바텀시트) 기반 |
| `components/ThreadList.tsx` | 스레드 목록 렌더링 (날짜별 그룹핑) |
| `components/ThreadListContainer.tsx` | 스레드 목록 컨테이너 (로딩/빈 상태 처리) |
| `components/ThreadHistoryLoading.tsx` | 스켈레톤 로딩 UI |
| `components/NewChatButton.tsx` | 새 채팅 버튼 |
| `components/thread-item/index.tsx` | 스레드 아이템 - 일반/편집 모드 전환 |
| `components/thread-item/ThreadItemNormal.tsx` | 스레드 아이템 일반 표시 |
| `components/thread-item/ThreadItemEditing.tsx` | 스레드 아이템 이름 편집 |
| `components/thread-item/ThreadItemMenu.tsx` | 스레드 아이템 컨텍스트 메뉴 (이름 변경, 삭제) |
| `hooks/useThreadItemEdit.ts` | 스레드 이름 편집 상태 관리 훅 |
| `hooks/useThreadOperations.ts` | 스레드 CRUD 작업 훅 (삭제, 이름 변경) |
| `utils/threadHelpers.ts` | 스레드 헬퍼 - 날짜별 그룹핑, 제목 생성 등 |

## For AI Agents

### Working In This Directory
- 반응형: 1024px 기준 데스크톱/모바일 분기 (`useMediaQuery`)
- 데스크톱: `motion.div`로 슬라이드 애니메이션, 모바일: `Sheet` 컴포넌트
- URL 상태: `chatHistoryOpen` (nuqs), `threadId` (nuqs)
- 스레드 목록은 `useThreads()` 훅에서 관리 (ThreadProvider)
- UI 텍스트는 `constants.ts`에 한국어로 정의
- `config.threads`의 설정값으로 기능 토글: `showHistory`, `enableDeletion`, `enableTitleEdit`

## Dependencies

### Internal
- `src/hooks/useThreads` - 스레드 목록 상태
- `src/hooks/useSettings` - 설정 (showHistory 등)
- `src/hooks/useMediaQuery` - 반응형 분기
- `src/providers/client.ts` - LangGraph 클라이언트 (삭제/업데이트 API)
- `src/lib/api-key.tsx` - API 키

### External
- `@langchain/langgraph-sdk` - `Thread` 타입
- `nuqs` - URL 쿼리 파라미터
- `sonner` - 토스트 알림
- `lucide-react` - 아이콘
- `date-fns` - 날짜 포맷

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
