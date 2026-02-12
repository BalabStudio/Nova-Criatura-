# Task: Vercel Deployment & API Robustness

## Objective
Standardize the codebase according to `[Meu Skills]` patterns to ensure a successful and stable deployment on Vercel, fixing documentation inconsistencies and improving error resilience.

## CRITICAL: NO DESIGN CHANGES
- Do not modify `app/globals.css`.
- Do not modify UI layout, colors, or typography in components.
- Fixes must be limited to logic, organization, and documentation.

## Proposed Changes

### 1. Architecture & API Layer (Skill 03)
- Create `services/api.service.ts` to centralize API logic.
- Replace direct `fetch` calls in `app/page.tsx` and `app/programacao/page.tsx` with calls to the service.
- Implement standardized error handling (Skill 09).

### 2. Stability & Environment (Skill 13)
- Update `lib/supabase.ts` to be more robust.
- Create `.env.example` to document required Vercel variables.
- Fix "date shifting" in API routes to ensure timezone consistency.

### 3. Documentation Sync
- Update `DOCUMENTATION.md` to correctly reflect Supabase as the primary database, removing stale Redis references.

### 4. Code Quality
- Add `.eslintrc.json` if missing to enforce standards in Vercel's build pipeline.

## Implementation Steps
1. Create `services/api.service.ts`.
2. Refactor `app/page.tsx` logic.
3. Refactor `app/programacao/page.tsx` logic.
4. Correct `DOCUMENTATION.md`.
5. Create `.env.example`.
6. Final verification with `checklist.py`.
