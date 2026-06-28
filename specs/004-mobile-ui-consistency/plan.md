# Implementation Plan: Mobile UI Consistency and Usability

**Branch**: `004-mobile-ui-consistency` | **Date**: 2026-06-28 | **Spec**: `specs/004-mobile-ui-consistency/spec.md`

**Input**: Feature specification from `/specs/004-mobile-ui-consistency/spec.md`

## Summary

Unify the authenticated app UI around a mobile-first design system: a stable shared header, page-level toolbars for actions, safe title typography, touch-friendly admin role controls, and consistent card/list surfaces across ordering, account, admin, and barista pages. The implementation keeps the existing Next.js and Supabase architecture, and focuses on correcting UI structure and validation rather than adding product scope.

## Technical Context

**Language/Version**: TypeScript with React 19 and Next.js 16 App Router

**Primary Dependencies**: Next.js, React, Supabase SSR/Auth, existing CSS/Tailwind utility setup

**Storage**: Existing Supabase Postgres data; no new persistence required

**Testing**: `npm run typecheck`, `npm run lint`, local browser validation on phone-sized viewport; Playwright where browser binaries are available

**Target Platform**: Mobile-first web app with desktop support

**Project Type**: Single Next.js web application

**Performance Goals**: Authenticated pages should render without layout thrash or horizontal overflow on 390px-wide viewports

**Constraints**: No new runtime dependencies; preserve existing auth, order, admin, and barista behavior; maintain readable contrast when using translucent surfaces

**Scale/Scope**: Four authenticated experiences: order, account, admin, barista

## Constitution Check

- **Hospitality**: Pass. The work removes friction and confusion for members and staff instead of adding commercial features.
- **Mobile speed**: Pass. The primary goal is comfortable phone use and faster order/admin actions.
- **Barista calm**: Pass. Barista mobile interaction keeps one-tap order advancement primary.
- **Shared privacy**: Pass. No additional private data is exposed.
- **Simplicity and reliability**: Pass. No new dependency or architectural layer is introduced; validation targets complete user journeys.

## Project Structure

### Documentation (this feature)

```text
specs/004-mobile-ui-consistency/
├── spec.md
├── plan.md
├── quickstart.md
├── tasks.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── app/
│   └── globals.css
└── components/
    ├── account/
    ├── admin/
    ├── barista/
    ├── board/
    ├── home/
    ├── layout/
    └── order/
```

**Structure Decision**: Use the existing single app structure. Shared layout rules live in `src/app/globals.css`; page-specific markup remains in the existing component folders.

## Design Decisions

- Header actions are not page navigation. Multi-button action groups belong in a body-level `page-toolbar`.
- Native selects are inappropriate for admin role changes on mobile; use an in-page segmented control.
- Page titles and hero text must use non-negative letter spacing and safe line heights to prevent clipping.
- Glass surfaces may be used sparingly on headers, cards, and bottom bars, but must not reduce contrast or increase layout instability.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
