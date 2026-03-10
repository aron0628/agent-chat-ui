<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# public

## Purpose
Next.js 정적 자산 디렉토리. 브라우저에서 직접 접근 가능한 파일들로, YAML 기반 설정 파일과 브랜딩 이미지를 포함한다.

## Key Files

| File | Description |
|------|-------------|
| `settings.yaml` | 메인 앱 설정 파일 - 브랜딩, 테마, UI, 스레드 옵션 등 전체 설정 (chat-config.yaml 대체) |
| `chat-config.yaml` | 레거시 설정 파일 - settings.yaml이 없을 때 폴백으로 사용 |
| `chat-openers.yaml` | 채팅 시작 시 표시되는 추천 질문 목록 |
| `full-description.md` | 앱 상세 설명 마크다운 (FullDescriptionModal에서 렌더링) |
| `logo.png` | 앱 로고 이미지 |
| `logo-c.svg` | 대체 로고 SVG |

## For AI Agents

### Working In This Directory
- `settings.yaml` 수정 시 `src/lib/config.ts`의 `ChatConfig` 인터페이스와 일치해야 함
- YAML 파일은 `js-yaml` 라이브러리로 파싱됨
- 설정 로드 순서: `settings.yaml` → `chat-config.yaml` → `defaultConfig` (폴백)
- `chat-openers.yaml`은 별도로 로드되어 branding.chatOpeners에 병합됨

### Configuration Schema
```yaml
branding:
  appName: string
  logoPath: string
  logoWidth: number
  logoHeight: number
  description: string
  fullDescription: string  # MD 파일 경로
buttons:
  enableFileUpload: boolean
  chatInputPlaceholder: string
threads:
  showHistory: boolean
  enableDeletion: boolean
  enableTitleEdit: boolean
  autoGenerateTitles: boolean
  sidebarOpenByDefault: boolean
theme:
  fontFamily: "sans" | "serif" | "mono"
  fontSize: "small" | "medium" | "large"
  colorScheme: "light" | "dark" | "auto"
ui:
  autoCollapseToolCalls: boolean
  chatWidth: "default" | "wide"
```

## Dependencies

### Internal
- `src/lib/config.ts` - 클라이언트 사이드 설정 로더
- `src/lib/config-server.ts` - 서버 사이드 설정 로더

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
