# Tasks: Shared Coffee Ordering Queue

**Input**: Design documents from `/specs/001-shared-coffee-queue/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: Required by the project constitution for core order placement,
status synchronization, mobile usability, and concurrent queue behavior.

**Organization**: Tasks are grouped by user story so each journey can be
implemented and verified as an independently valuable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it changes different files and does not
  depend on an unfinished task.
- **[Story]**: Maps the task to User Story 1, 2, or 3.
- Every task names the file or directory it changes.

## Phase 1: Setup

**Purpose**: Initialize the application and development toolchain.

- [X] T001 Initialize a Next.js 16 App Router TypeScript application with `src/`, Tailwind CSS, ESLint, and npm scripts in `package.json`, `src/app/`, `tsconfig.json`, and `eslint.config.mjs`
- [X] T002 [P] Add Supabase, Zod, cookie-signing, and password-hashing runtime dependencies plus Vitest, Testing Library, and Playwright development dependencies in `package.json`
- [X] T003 [P] Configure Vitest with a browser-like test environment and shared setup in `vitest.config.ts` and `tests/setup.ts`
- [X] T004 [P] Configure Playwright desktop and mobile projects plus local web-server startup in `playwright.config.ts`
- [X] T005 [P] Create safe environment documentation and ignore rules in `.env.example` and `.gitignore`
- [X] T006 [P] Create the base responsive design tokens, typography, focus styles, and reduced-motion behavior in `src/app/globals.css`
- [X] T007 Create the shared root layout and route chooser linking to member ordering and barista views in `src/app/layout.tsx` and `src/app/page.tsx`

---

## Phase 2: Foundational

**Purpose**: Build shared data, security, validation, and board infrastructure
required by every user story.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [X] T008 Create PostgreSQL enum types, members, menu items, coffee sessions, and orders tables with timestamps, foreign keys, validation constraints, request idempotency, and the one-open-session partial unique index in `supabase/migrations/001_initial_schema.sql`
- [X] T009 Add RLS enablement, public read policies or safe board projection access, and denial of anonymous direct mutations in `supabase/migrations/002_security_policies.sql`
- [X] T010 [P] Seed placeholder regular-member records and the Americano, latte, and mocha menu in `supabase/seed.sql`, clearly marking member names for replacement before deployment
- [X] T011 [P] Define shared domain, API response, session, menu, and order types in `src/types/coffee.ts`
- [ ] T012 [P] Implement browser, server, and service-role Supabase client factories with strict environment checks in `src/lib/supabase/browser.ts`, `src/lib/supabase/server.ts`, and `src/lib/supabase/admin.ts`
- [X] T013 [P] Implement Zod schemas for member/guest identity, order creation, PIN login, session actions, and status transitions in `src/lib/validation/schemas.ts`
- [X] T014 Implement the authoritative active-board query with open-session lookup, sorted member/menu data, and five-minute Ready filtering in `src/lib/orders/get-board.ts`
- [X] T015 Implement the public `GET /api/board` handler with no-store caching and stable error responses in `src/app/api/board/route.ts`
- [X] T016 [P] Implement reusable API success/error helpers and request parsing in `src/lib/http/responses.ts`
- [ ] T017 [P] Implement the shared board column, order card, status label, empty state, loading state, and reconnecting state components in `src/components/board/`
- [ ] T018 Implement the realtime invalidation hook with debounced refetch, reconnect handling, visibility refetch, and Ready-expiration timers in `src/lib/orders/use-live-board.ts`
- [X] T019 [P] Add unit tests for validation boundaries and Ready visibility calculations in `tests/unit/validation.test.ts` and `tests/unit/ready-expiration.test.ts`
- [ ] T020 Add integration tests for the active-board projection, sorting, expired Ready exclusion, and no-open-session response in `tests/integration/board-route.test.ts`

**Checkpoint**: The database can be migrated and a read-only active board can be
loaded safely, refreshed, and tested.

---

## Phase 3: User Story 1 — Place a Coffee Order (Priority: P1) 🎯 MVP Slice

**Goal**: A regular member or guest can place a valid hot/iced drink order from
a phone without logging in.

**Independent Test**: With an open seeded session, use only `/order` to select a
regular member or guest, configure a drink, submit it, and receive a confirmed
Just ordered card.

### Tests for User Story 1

- [ ] T021 [P] [US1] Add contract tests for valid member orders, valid guest orders, invalid identity/menu combinations, closed sessions, and duplicate request IDs in `tests/integration/orders-route.test.ts`
- [ ] T022 [P] [US1] Add component tests for remembered member selection, guest-name entry, conditional dairy information, required temperature, note limits, and submission states in `tests/unit/order-form.test.tsx`
- [ ] T023 [P] [US1] Add a phone-viewport Playwright journey for a regular member and guest placing orders in `tests/e2e/member-ordering.spec.ts`

### Implementation for User Story 1

- [X] T024 [P] [US1] Implement idempotent order creation that validates the open session, active member or guest identity, active menu item, dairy rules, and note length in `src/lib/orders/create-order.ts`
- [ ] T025 [US1] Implement `POST /api/orders` with stable 201, 400, 409, and 429 responses in `src/app/api/orders/route.ts`
- [ ] T026 [P] [US1] Implement the member/guest identity picker with local-device member remembrance and change-person control in `src/components/order/identity-picker.tsx`
- [ ] T027 [P] [US1] Implement drink and temperature selection, dairy information, optional note input, and accessible validation in `src/components/order/drink-form.tsx`
- [X] T028 [US1] Compose the ordering flow, submission confirmation, closed-session state, and current shared board in `src/components/order/order-experience.tsx`
- [X] T029 [US1] Load initial board data and render the mobile-first ordering experience in `src/app/order/page.tsx`
- [X] T030 [US1] Connect successful submissions to immediate board refetch and duplicate-safe retry messaging in `src/components/order/order-experience.tsx`

**Checkpoint**: Members can place complete orders without the barista asking
them individually.

---

## Phase 4: User Story 2 — Prepare Drinks from a Live Queue (Priority: P1)

**Goal**: A PIN-authorized barista can open/close sessions and advance each
order through Just ordered, In progress, and Ready with one action per state.

**Independent Test**: Using only `/barista`, authenticate with the shared PIN,
open a session, process several pre-created orders, exercise undo, and close the
session with an active-order warning.

### Tests for User Story 2

- [ ] T031 [P] [US2] Add authentication contract tests for PIN shape, valid/invalid PINs, cookie properties, expiry, logout, and throttling in `tests/integration/barista-auth.test.ts`
- [ ] T032 [P] [US2] Add session API tests for authorization, one-open-session enforcement, active-order warning count, confirmed closure, and history retention in `tests/integration/barista-sessions.test.ts`
- [ ] T033 [P] [US2] Add status API tests for legal transitions, stale-state conflicts, ten-second undo, expired undo, and cross-session rejection in `tests/integration/order-status.test.ts`
- [ ] T034 [P] [US2] Add Playwright coverage for PIN login, session opening, one-tap order transitions, undo, active-order close warning, confirmation, and logout in `tests/e2e/barista-queue.spec.ts`

### Implementation for User Story 2

- [X] T035 [P] [US2] Implement PIN hash verification, signed eight-hour HTTP-only cookie creation/verification, and logout clearing in `src/lib/auth/barista-session.ts`
- [ ] T036 [P] [US2] Implement a bounded per-client PIN-attempt limiter suitable for the selected deployment in `src/lib/auth/login-rate-limit.ts`
- [X] T037 [US2] Implement barista login and logout Route Handlers in `src/app/api/barista/login/route.ts` and `src/app/api/barista/logout/route.ts`
- [X] T038 [P] [US2] Implement transactional coffee-session open and close operations with active-order counting in `src/lib/orders/manage-session.ts`
- [X] T039 [US2] Implement authorized open and current-session close handlers in `src/app/api/barista/sessions/route.ts` and `src/app/api/barista/sessions/current/route.ts`
- [ ] T040 [P] [US2] Implement conditional order-state transitions, timestamp updates, conflict detection, and ten-second inverse undo in `src/lib/orders/update-status.ts`
- [X] T041 [US2] Implement the authorized status Route Handler in `src/app/api/barista/orders/[orderId]/status/route.ts`
- [ ] T042 [P] [US2] Implement the accessible four-digit PIN form and authentication error states in `src/components/barista/pin-form.tsx`
- [ ] T043 [P] [US2] Implement session open/close controls and active-order confirmation dialog in `src/components/barista/session-controls.tsx`
- [ ] T044 [P] [US2] Implement barista order cards with one context action, pending protection, conflict feedback, and timed Undo affordance in `src/components/barista/barista-order-card.tsx`
- [X] T045 [US2] Compose authenticated queue management, live board refresh, logout, and session controls in `src/components/barista/barista-experience.tsx`
- [X] T046 [US2] Verify the signed cookie server-side and render either PIN entry or the queue in `src/app/barista/page.tsx`

**Checkpoint**: The barista can run a complete coffee gathering without verbal
order collection or manual Ready-card cleanup.

---

## Phase 5: User Story 3 — Watch the Shared Coffee Board (Priority: P2)

**Goal**: Every participant can follow the complete live queue and see Ready
orders disappear automatically after five minutes.

**Independent Test**: Open the board on a separate phone-sized browser, mutate
orders elsewhere, and verify all three columns update within two seconds without
manual refresh or barista cleanup.

### Tests for User Story 3

- [ ] T047 [P] [US3] Add component tests for column grouping, first-name-only display, ordering rules, empty columns, reconnecting state, and expiration scheduling in `tests/unit/shared-board.test.tsx`
- [ ] T048 [P] [US3] Add a two-browser-context Playwright test for insert/update synchronization, reconnect refetch, and five-minute Ready disappearance in `tests/e2e/live-board.spec.ts`
- [ ] T049 [P] [US3] Add a 20-order Playwright scenario verifying no loss, duplication, or incorrect status grouping in `tests/e2e/queue-load.spec.ts`

### Implementation for User Story 3

- [X] T050 [P] [US3] Create the participant-facing shared board composition with Just ordered, In progress, and Ready sections in `src/components/board/shared-board.tsx`
- [ ] T051 [US3] Integrate `use-live-board` into the shared board so Realtime events, focus, reconnect, local mutations, and expiration all refetch authoritative data in `src/components/board/live-shared-board.tsx`
- [ ] T052 [US3] Embed the same live board in member and barista experiences without exposing barista controls publicly in `src/components/order/order-experience.tsx` and `src/components/barista/barista-experience.tsx`
- [ ] T053 [US3] Add accessible live-region announcements for order-state changes and non-color status indicators in `src/components/board/live-shared-board.tsx` and `src/app/globals.css`

**Checkpoint**: Participants can understand the queue without asking the
barista, and Ready orders clean themselves off the active board.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Harden the complete feature for deployment and a real gathering.

- [X] T054 [P] Add structured server error logging that excludes PINs, secrets, and unnecessary personal data in `src/lib/observability/logger.ts`
- [X] T055 [P] Add security headers and disable unnecessary framework disclosure in `next.config.ts`
- [X] T056 [P] Add a production-ready README covering setup, Supabase migration/seed, replacing placeholder member names, PIN hash generation, deployment, and rollback in `README.md`
- [X] T057 Replace placeholder seed names with the approved nine member display names in `supabase/seed.sql`
- [X] T058 Run and fix lint, typecheck, unit/integration tests, Playwright tests, and production build using scripts in `package.json`
- [X] T059 Validate every scenario and mobile/accessibility check in `specs/001-shared-coffee-queue/quickstart.md` and record any deviations in `specs/001-shared-coffee-queue/checklists/requirements.md`
- [X] T060 Review deployed Supabase RLS policies and Vercel environment separation, then document the verified production configuration in `README.md`

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational; provides the first useful ordering
  slice.
- **US2 (Phase 4)**: Depends on Foundational and uses orders created by US1 for
  the full demonstration. Its API and UI can otherwise be developed in parallel
  with late US1 UI work.
- **US3 (Phase 5)**: Depends on the shared board foundation. Its final E2E test
  depends on US1 order creation and US2 status mutations.
- **Polish (Phase 6)**: Depends on all selected user stories.

### User story dependency graph

```text
Setup → Foundation ─┬→ US1: Place orders ───────┐
                    ├→ US2: Run barista queue ──┼→ US3: Observe full live flow
                    └→ US3 board components ────┘
```

### Within each user story

1. Write the story's tests and confirm they fail for the intended reason.
2. Implement domain/service logic.
3. Implement Route Handlers.
4. Implement UI components and page composition.
5. Run the independent story test before moving on.

## Parallel Opportunities

### Setup and foundation

```text
T002 dependencies
T003 Vitest configuration
T004 Playwright configuration
T005 environment files
T006 global styles

After schema agreement:
T010 seed data
T011 domain types
T012 Supabase clients
T013 validation schemas
T016 HTTP helpers
T017 shared board components
```

### User Story 1

```text
T021 API contract tests
T022 order-form component tests
T023 mobile E2E skeleton
T024 order service
T026 identity picker
T027 drink form
```

### User Story 2

```text
T031 auth tests
T032 session tests
T033 status tests
T034 barista E2E skeleton
T035 cookie auth
T036 login limiter
T038 session service
T040 status service
T042 PIN form
T043 session controls
T044 order cards
```

### User Story 3

```text
T047 shared-board component tests
T048 realtime E2E skeleton
T049 load E2E skeleton
T050 shared-board composition
```

## Implementation Strategy

### MVP first

The smallest demonstrable value requires Foundation plus both P1 stories:

1. Complete Setup and Foundation.
2. Complete US1 so members can submit orders.
3. Complete US2 so the barista can receive and process them.
4. Validate the member-to-barista flow before adding the polished shared-board
   experience.

US1 alone is independently testable but not sufficient to solve the whole
real-world problem; the recommended MVP is US1 + US2.

### Incremental delivery

1. **Read-only skeleton**: database, board endpoint, and empty states.
2. **Order capture**: member and guest orders.
3. **Barista operations**: PIN, sessions, transitions, undo.
4. **Coffee-shop delight**: live shared board and automatic Ready expiration.
5. **Gathering-ready**: production configuration, real member names, and mobile
   validation.

## Notes

- Keep service-role credentials and PIN material server-only.
- Never weaken RLS to make a browser test pass.
- Use deterministic clocks in expiration and undo tests.
- Preserve one deliberate barista action per forward state transition.
- Do not introduce payments, inventory, account login, saved usuals, or menu
  administration in this feature.
