# API Domain Mapping

Last updated: 2026-04-03

## Domain Inventory

| Domain | Route Files | Endpoints | Validator | Types | Page | Group |
|--------|-------------|-----------|-----------|-------|------|-------|
| tasks | 10 | 13 | task.ts | task-status.ts | tasks.mdx | Core |
| projects | 3 | 7 | project.ts | — | projects.mdx | Core |
| workflows | 7 | 11 | blueprint.ts | workflows/types.ts | workflows.mdx | Core |
| blueprints | 3 | 5 | blueprint.ts | — | — | Core |
| schedules | 3 | 5 | — | — | — | Core |
| chat | 6 | 9 | — | chat/types.ts | — | Intelligence |
| profiles | 8 | 10 | profile.ts | agents/profiles/types.ts | — | Intelligence |
| runtimes | 1 | 2 | — | agents/runtime/catalog.ts | — | Intelligence |
| memory | 1 | 2 | — | — | — | Intelligence |
| documents | 3 | 5 | — | — | — | Content |
| tables | 8 | 12 | — | tables/types.ts | — | Content |
| uploads | 2 | 4 | — | — | — | Content |
| views | 1 | 3 | — | — | — | Content |
| settings | 10 | 14 | settings.ts | — | — | Platform |
| permissions | 2 | 5 | — | — | — | Platform |
| notifications | 3 | 6 | — | — | — | Platform |
| channels | 4 | 6 | — | — | — | Platform |
| environment | 6 | 8 | — | — | — | Platform |
| snapshots | 2 | 4 | — | — | — | Platform |
| workspace | 2 | 3 | workspace.ts | — | — | Platform |
| logs | 1 | 1 | — | — | — | Operations |
| handoffs | 1 | 2 | — | — | — | Operations |
| data | 1 | 2 | — | — | — | Operations |
| context | 1 | 1 | — | — | — | Operations |
| command-palette | 1 | 1 | — | — | — | Operations |
| user-guide | 1 | 1 | — | — | — | Operations |
| book | 1 | 1 | — | — | — | Operations |

## Route File Locations

### Core
- `src/app/api/tasks/` — route.ts, [id]/route.ts, [id]/execute/route.ts, [id]/resume/route.ts, [id]/cancel/route.ts, [id]/respond/route.ts, [id]/output/route.ts, [id]/logs/route.ts, [id]/provenance/route.ts, [id]/siblings/route.ts
- `src/app/api/projects/` — route.ts, [id]/route.ts, [id]/documents/route.ts
- `src/app/api/workflows/` — route.ts, [id]/route.ts, [id]/execute/route.ts, [id]/status/route.ts, [id]/documents/route.ts, [id]/steps/[stepId]/retry/route.ts, from-assist/route.ts
- `src/app/api/blueprints/` — route.ts, [id]/route.ts, [id]/instantiate/route.ts, import/route.ts
- `src/app/api/schedules/` — route.ts, [id]/route.ts, [id]/heartbeat-history/route.ts, parse/route.ts

### Intelligence
- `src/app/api/chat/` — conversations/route.ts, conversations/[id]/route.ts, conversations/[id]/messages/route.ts, conversations/[id]/respond/route.ts, models/route.ts, suggested-prompts/route.ts, entities/search/route.ts
- `src/app/api/profiles/` — route.ts, [id]/route.ts, [id]/test/route.ts, [id]/test-results/route.ts, [id]/test-single/route.ts, [id]/context/route.ts, assist/route.ts, import/route.ts, import-repo/route.ts
- `src/app/api/runtimes/` — route.ts
- `src/app/api/memory/` — route.ts

### Content
- `src/app/api/documents/` — route.ts, [id]/route.ts, [id]/file/route.ts, [id]/versions/route.ts
- `src/app/api/tables/` — route.ts, [id]/route.ts, [id]/rows/route.ts, [id]/columns/route.ts, [id]/charts/route.ts, [id]/triggers/route.ts, [id]/export/route.ts, [id]/import/route.ts, [id]/history/route.ts, templates/route.ts
- `src/app/api/uploads/` — route.ts, [id]/route.ts, cleanup/route.ts
- `src/app/api/views/` — route.ts

### Platform
- `src/app/api/settings/` — route.ts, openai/route.ts, chat/route.ts, test/route.ts, budgets/route.ts, providers/route.ts, routing/route.ts, learning/route.ts, author-default/route.ts, browser-tools/route.ts, pricing/route.ts, ollama/route.ts, web-search/route.ts, runtime/route.ts
- `src/app/api/permissions/` — route.ts, presets/route.ts
- `src/app/api/notifications/` — route.ts, [id]/route.ts, mark-all-read/route.ts, pending-approvals/route.ts, pending-approvals/stream/route.ts
- `src/app/api/channels/` — route.ts, [id]/route.ts, [id]/test/route.ts, inbound/slack/route.ts, inbound/telegram/route.ts, inbound/telegram/poll/route.ts
- `src/app/api/environment/` — scan/route.ts, artifacts/route.ts, checkpoints/route.ts, templates/route.ts, sync/route.ts, sync/preview/route.ts, sync/history/route.ts
- `src/app/api/snapshots/` — route.ts, [id]/route.ts, [id]/restore/route.ts
- `src/app/api/workspace/` — discover/route.ts, context/route.ts, import/route.ts

### Operations
- `src/app/api/logs/` — stream/route.ts
- `src/app/api/handoffs/` — route.ts
- `src/app/api/data/` — clear/route.ts, seed/route.ts
- `src/app/api/context/` — batch/route.ts
- `src/app/api/command-palette/` — recent/route.ts
- `src/app/api/user-guide/` — status/route.ts
- `src/app/api/book/` — route.ts

## Validator Files

| File | Schemas | Used By |
|------|---------|---------|
| task.ts | createTaskSchema, updateTaskSchema | tasks |
| project.ts | createProjectSchema, updateProjectSchema | projects |
| blueprint.ts | createBlueprintSchema | blueprints, workflows |
| profile.ts | profileSchema | profiles |
| settings.ts | settingsSchema | settings |
| workspace.ts | workspaceImportSchema | workspace |

## Notes

- `command-palette`, `user-guide`, and `book` are internal-facing APIs with limited external utility. Consider omitting from the public API docs unless the user requests them.
- Settings has 14+ sub-routes for different configuration domains. Consider documenting as one page with grouped sections.
- The `chat/conversations/[id]/messages` endpoint uses SSE streaming for real-time responses.
- The `notifications/pending-approvals/stream` endpoint uses SSE for real-time approval notifications.
- The `logs/stream` endpoint uses SSE for real-time agent log streaming.
