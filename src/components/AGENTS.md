<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# components

## Purpose
React 컴포넌트 모듈. 채팅 UI의 모든 시각적 요소를 담당하며, 공통 UI 프리미티브(ui/), 채팅 스레드(thread/), 설정 다이얼로그(settings/), 아이콘(icons/)으로 구성된다.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `thread/` | 메인 채팅 UI - 메시지 렌더링, 입력, 히스토리, 에이전트 인박스 (see `thread/AGENTS.md`) |
| `ui/` | shadcn/ui 기반 공통 UI 프리미티브 - Button, Dialog, Input 등 (see `ui/AGENTS.md`) |
| `settings/` | 연결 및 설정 다이얼로그 (see `settings/AGENTS.md`) |
| `icons/` | 커스텀 SVG 아이콘 컴포넌트 (see `icons/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- shadcn/ui 컴포넌트는 `ui/`에, 비즈니스 로직 컴포넌트는 `thread/` 또는 `settings/`에 배치
- 새로운 UI 프리미티브 필요 시 `npx shadcn@latest add <component>` 사용
- 모든 컴포넌트는 Tailwind CSS + `cn()` 유틸리티로 스타일링
- Radix UI 프리미티브 기반의 접근성 표준 준수

## Dependencies

### Internal
- `src/hooks/` - Context 접근 훅
- `src/lib/` - 유틸리티, 상수
- `src/providers/` - 전역 상태

### External
- `@radix-ui/*` - 헤드리스 UI 프리미티브
- `lucide-react` - 아이콘
- `framer-motion` - 애니메이션
- `react-markdown` - 마크다운 렌더링

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
