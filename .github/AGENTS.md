<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-03-10 | Updated: 2026-03-10 -->

# .github

## Purpose
GitHub Actions CI 워크플로우 설정 디렉토리.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `workflows/` | GitHub Actions 워크플로우 정의 |

## Key Files

| File | Description |
|------|-------------|
| `workflows/ci.yml` | PR/push 시 실행되는 CI 파이프라인 - format, lint, spelling 검사 |

## For AI Agents

### Working In This Directory
- CI는 pnpm v10.5.1 + Node 18.x 사용
- 4개의 독립적 job 실행: format, lint, readme-spelling, check-spelling
- 동일 branch/PR에 대한 동시 실행은 자동 취소 (`cancel-in-progress: true`)
- `.codespellignore`로 맞춤법 검사 예외 단어 관리

### CI Jobs
| Job | Command | Scope |
|-----|---------|-------|
| `format` | `pnpm format:check` | 전체 파일 |
| `lint` | `pnpm lint` | 전체 파일 |
| `readme-spelling` | codespell | README.md |
| `check-spelling` | codespell | src/ |

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
