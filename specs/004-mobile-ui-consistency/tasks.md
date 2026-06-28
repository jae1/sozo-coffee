# Tasks: Mobile UI Consistency and Usability

**Input**: Design documents from `/specs/004-mobile-ui-consistency/`

**Prerequisites**: plan.md, spec.md, quickstart.md

**Tests**: Static checks and manual mobile viewport validation are required by the specification.

**Organization**: Tasks are grouped by independently testable user story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the shared UI language before page-specific changes.

- [x] T001 Define shared header, toolbar, title, card, and glass surface primitives in `src/app/globals.css`
- [x] T002 Update `src/components/layout/site-header.tsx` to use structured brand and action containers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove global typography and layout causes of mobile breakage.

- [x] T003 Remove negative heading letter spacing and unsafe sub-1 line heights in `src/app/globals.css`
- [x] T004 Create shared `section-title`, `auth-title`, `empty-state-title`, and `order-hero__title` rules in `src/app/globals.css`
- [x] T005 Move multi-button page actions out of headers into body-level `page-toolbar` patterns in `src/components/account/account-experience.tsx`, `src/components/admin/admin-experience.tsx`, and `src/components/barista/barista-experience.tsx`

**Checkpoint**: Shared layout system exists and authenticated pages can stop crowding header actions.

---

## Phase 3: User Story 1 - Order on a phone without visual breakage (Priority: P1) MVP

**Goal**: A signed-in member can use the ordering page on a phone without clipped text, header wrapping, or unreachable primary actions.

**Independent Test**: Sign in on a 390px viewport, open `/order`, select a drink, add it to the order, and place it while checking header, hero, and bottom bar.

- [x] T006 [US1] Replace oversized ordering hero typography with `order-hero__title` in `src/components/order/order-experience.tsx`
- [x] T007 [US1] Stabilize mobile ordering hero spacing and remove sticky tab/header conflicts in `src/app/globals.css`
- [x] T008 [US1] Convert order account access to a compact avatar chip in `src/components/order/order-experience.tsx`
- [x] T009 [US1] Improve mobile bottom order summary content in `src/components/order/order-experience.tsx`

**Checkpoint**: Ordering is independently usable on a phone-sized viewport.

---

## Phase 4: User Story 2 - Manage roles without broken mobile admin UI (Priority: P1)

**Goal**: Admin role management works on mobile without broken headers, native dropdown overlays, or truncated rows.

**Independent Test**: Sign in as admin on a 390px viewport, open `/admin`, inspect rows, and change a non-self member role via segmented buttons.

- [x] T010 [US2] Move admin navigation actions into `page-toolbar` in `src/components/admin/admin-experience.tsx`
- [x] T011 [US2] Constrain admin page width and compact page heading scale in `src/app/globals.css`
- [x] T012 [US2] Replace native role select with segmented role buttons in `src/components/admin/admin-experience.tsx`
- [x] T013 [US2] Style admin member rows and role controls for mobile in `src/app/globals.css`
- [x] T023 [US2] Replace the signed-in admin's role control with a non-interactive locked badge in `src/components/admin/admin-experience.tsx` and `src/app/globals.css`

**Checkpoint**: Admin role management is independently usable on mobile.

---

## Phase 5: User Story 3 - Use account and barista pages with one visual system (Priority: P2)

**Goal**: Staff/admin users experience account, admin, ordering, and barista pages as one coherent app.

**Independent Test**: Visit `/account`, `/admin`, `/order`, and `/barista` on mobile and desktop; compare header, toolbar, card, title, and action treatment.

- [x] T014 [US3] Keep account navigation as hub cards and remove duplicate toolbar actions in `src/components/account/account-experience.tsx`
- [x] T015 [US3] Move barista café open/close action into `page-toolbar` in `src/components/barista/barista-experience.tsx`
- [x] T016 [US3] Normalize account favorites/history card patterns in `src/components/account/account-experience.tsx` and `src/app/globals.css`
- [x] T017 [US3] Normalize order status board markup and card styles in `src/components/board/shared-board.tsx` and `src/app/globals.css`
- [x] T018 [US3] Normalize barista list, order number, customer name, and mobile action styles in `src/components/barista/barista-experience.tsx` and `src/app/globals.css`
- [x] T024 [US3] Remove duplicate authenticated header subtitles, repeated account/admin CTAs, and redundant section eyebrow labels in account, admin, order, and barista pages
- [x] T025 [US3] Move account sign-out out of the primary work hub and into a low-priority account footer in `src/components/account/account-experience.tsx` and `src/app/globals.css`
- [x] T026 [US3] Rework barista board layout with consistent hero actions, status summary cards, hidden empty drag targets, and shared empty-state styling in `src/components/barista/barista-experience.tsx` and `src/app/globals.css`
- [x] T027 [US3] Remove redundant ready status badges from account order history in `src/components/account/account-experience.tsx` and `src/app/globals.css`
- [x] T028 [US3] Limit account order history to five visible rows with a progressive show-more control in `src/components/account/account-experience.tsx` and `src/app/globals.css`
- [x] T029 [US3] Add role-aware primary app tabs for Order, Status, Board, Admin, and Account with mobile bottom placement and desktop compact placement in `src/components/navigation/app-tabs.tsx`, authenticated pages, and `src/app/globals.css`
- [x] T030 [US3] Remove account hub cards that duplicate primary app tabs from `src/components/account/account-experience.tsx` and `src/app/globals.css`

**Checkpoint**: Authenticated pages share one visual system.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate and clean up across all stories.

- [x] T019 Run `npm run typecheck`
- [x] T020 Run `npm run lint`
- [ ] T021 Validate `/order`, `/account`, `/admin`, and `/barista` on a real or in-app 390px-wide viewport using `specs/004-mobile-ui-consistency/quickstart.md`
- [ ] T022 Capture before/after screenshots or notes for remaining visual defects

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **US1 and US2 (Phase 3/4)**: Can proceed after Foundational; both are P1
- **US3 (Phase 5)**: Depends on shared primitives and benefits from US1/US2 patterns
- **Polish (Phase 6)**: Depends on desired user stories

### Implementation Strategy

1. Complete shared primitives and heading fixes.
2. Fix ordering and admin as P1 independent slices.
3. Apply the same visual language to account, barista, and status board.
4. Run static checks.
5. Validate all authenticated pages on a 390px-wide viewport before commit/push.
