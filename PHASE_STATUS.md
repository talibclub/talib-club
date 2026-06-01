# Phase Status

## Current Implementation

- Phase 1: complete.
- Phase 2: complete for the current Firebase implementation.
- Phase 3: complete for the planned AI quiz and article bookmark scope.

## Phase 2 Completed

- Login/Register and member dashboard.
- Reading Streak from learning activity and saved Quran verses.
- My Bookshelf with status, progress tracking, notes, and latest quiz score.

## Phase 3 Completed

- Article bookmarks.
- AI Quiz after finishing a book.
- Quiz result saving on bookshelf items.
- `/api/generate-quiz` with provider order:
  1. OpenAI (`OPENAI_API_KEY`)
  2. Anthropic (`ANTHROPIC_API_KEY`)
  3. Local metadata fallback when no AI key is configured

## AI Quiz Setup

Set one of these server-side environment variable groups on Netlify/Vercel:

- `OPENAI_API_KEY` and optional `OPENAI_MODEL` (default: `gpt-4o-mini`)
- `ANTHROPIC_API_KEY` and optional `ANTHROPIC_MODEL` (default: `claude-sonnet-4-20250514`)

NotebookLM can still be useful for team-side content preparation, but the app uses API-based generation so users can create quizzes directly inside the member experience.
