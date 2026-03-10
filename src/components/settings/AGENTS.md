<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# settings

## Purpose
앱 설정 관련 다이얼로그 컴포넌트. LangGraph 서버 연결 설정과 사용자 테마/UI 설정을 관리한다.

## Key Files

| File | Description |
|------|-------------|
| `ConnectionDialog.tsx` | 연결 설정 다이얼로그 - API URL, Assistant ID, API Key 입력. URL 쿼리 파라미터 + localStorage 저장 |
| `SettingsDialog.tsx` | 사용자 설정 다이얼로그 - 폰트, 글자 크기, 색상 테마, 도구 호출 자동 접기, 채팅 너비 등 |

## For AI Agents

### Working In This Directory
- `ConnectionDialog`는 `nuqs`로 apiUrl/assistantId를 URL 쿼리 파라미터에 저장
- API Key는 localStorage (`lg:chat:apiKey`)에 저장 (보안을 위해 URL에 노출 안함)
- `SettingsDialog`는 `useSettings()` 훅의 `updateUserSettings()`로 설정 변경
- 모든 설정 변경은 실시간 반영 (localStorage + Context 상태 동시 업데이트)

## Dependencies

### Internal
- `src/hooks/useSettings` - 설정 상태
- `src/components/ui/` - Dialog, Input, Label, Button, Switch, PasswordInput

### External
- `nuqs` - URL 쿼리 파라미터 상태
- `lucide-react` - 아이콘

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
