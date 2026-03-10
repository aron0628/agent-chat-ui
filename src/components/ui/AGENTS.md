<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# ui

## Purpose
shadcn/ui 기반 공통 UI 프리미티브 컴포넌트. Radix UI 프리미티브를 래핑하여 Tailwind CSS 스타일링을 적용한 재사용 가능한 UI 빌딩 블록.

## Key Files

| File | Description |
|------|-------------|
| `button.tsx` | `Button` - 다양한 variant/size의 버튼 (default, destructive, outline, ghost, link) |
| `dialog.tsx` | `Dialog` - Radix Dialog 기반 모달 다이얼로그 |
| `input.tsx` | `Input` - 텍스트 입력 필드 |
| `textarea.tsx` | `Textarea` - 다중 줄 텍스트 입력 |
| `password-input.tsx` | `PasswordInput` - 비밀번호 입력 (표시/숨김 토글) |
| `label.tsx` | `Label` - 폼 라벨 |
| `card.tsx` | `Card` - 카드 레이아웃 (Header, Title, Description, Content, Footer) |
| `avatar.tsx` | `Avatar` - 아바타 이미지 + 폴백 |
| `tooltip.tsx` | `Tooltip` - Radix Tooltip 기반 툴팁 |
| `dropdown-menu.tsx` | `DropdownMenu` - Radix DropdownMenu 기반 컨텍스트 메뉴 |
| `sheet.tsx` | `Sheet` - 슬라이드 오버레이 패널 (모바일 사이드바용) |
| `separator.tsx` | `Separator` - 구분선 |
| `switch.tsx` | `Switch` - 토글 스위치 |
| `skeleton.tsx` | `Skeleton` - 로딩 스켈레톤 |
| `sonner.tsx` | `Toaster` - sonner 라이브러리 토스트 컨테이너 |

## For AI Agents

### Working In This Directory
- 모든 컴포넌트는 shadcn/ui로 생성됨 - 직접 수정보다 `npx shadcn@latest add <component>` 사용 권장
- `components.json` 설정: new-york 스타일, lucide 아이콘, `@/` 별칭
- 모든 컴포넌트는 `cn()` 유틸리티로 className 병합
- `class-variance-authority` (cva)로 variant 정의 (button.tsx 참고)
- Radix UI 프리미티브 기반 - 접근성(ARIA) 자동 지원
- `forwardRef` 패턴으로 DOM ref 전달

### Adding New Components
```bash
npx shadcn@latest add <component-name>
```

## Dependencies

### External
- `@radix-ui/react-dialog` - Dialog
- `@radix-ui/react-tooltip` - Tooltip
- `@radix-ui/react-avatar` - Avatar
- `@radix-ui/react-label` - Label
- `@radix-ui/react-separator` - Separator
- `@radix-ui/react-switch` - Switch
- `@radix-ui/react-slot` - Slot (Button asChild)
- `@radix-ui/react-visually-hidden` - VisuallyHidden
- `class-variance-authority` - Variant 정의
- `sonner` - Toast
- `lucide-react` - 아이콘

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
