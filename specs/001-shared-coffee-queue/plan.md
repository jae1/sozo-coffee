# Implementation Plan: Shared Coffee Ordering Queue

**Branch**: `main` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from
`/specs/001-shared-coffee-queue/spec.md`

## Summary

Build a mobile-first web application with two experiences over one live order
stream: `/order` for members and `/barista` for the coffee maker. Use Next.js
App Router and TypeScript for pages and server-side mutation handlers, Supabase
Postgres for durable session/order data, Supabase Realtime for live board
updates, Tailwind CSS for the small responsive interface, and Vercel for
deployment.

Public clients may read only the minimum active-board data needed for the shared
queue. All mutations pass through validated server Route Handlers. Barista
mutations additionally require a short-lived, signed, HTTP-only cookie created
after a four-digit PIN is verified server-side. Ready orders are hidden by a
time-based query rule five minutes after `ready_at`; no cleanup job is required
for correct board behavior.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20.9+  
**Primary Dependencies**: Next.js 16 App Router, React 19, Supabase JavaScript
client, Tailwind CSS 4, Zod  
**Storage**: Supabase-hosted PostgreSQL with migrations and Row Level Security  
**Testing**: Vitest + React Testing Library for units/components; Playwright for
mobile and multi-page end-to-end journeys  
**Target Platform**: Responsive modern mobile and desktop browsers; Vercel
serverless deployment  
**Project Type**: Single full-stack web application  
**Performance Goals**: Order and status changes visible on other open screens
within two seconds; first useful mobile view within two seconds on normal home
Wi-Fi; order submission feedback within one second excluding network failure  
**Constraints**: No member accounts; first-name-only public board; four-digit
shared barista PIN; at most one open coffee session; Ready cards disappear after
five minutes; one action per status transition  
**Scale/Scope**: Nine regular members, occasional guests, up to 20 active orders
per session, one barista or trusted substitute

## Constitution Check

*GATE: Passed before research and re-checked after design.*

- **Hospitality**: PASS — no payment, pricing, loyalty, analytics, or commercial
  workflow is introduced.
- **Mobile speed**: PASS — `/order` is a single short flow, remembers the last
  selected member locally, and avoids a redundant milk selector.
- **Barista calm**: PASS — each card exposes one context-appropriate transition
  button; automatic time filtering removes Ready cards.
- **Shared privacy**: PASS — the public projection contains first name and drink
  progress only; all barista mutations require a signed server cookie.
- **Simplicity and reliability**: PASS — one application and one managed data
  service; no custom backend server, queue worker, cron job, or member auth.
- **End-to-end validation**: PASS — Playwright covers two simultaneous browser
  contexts and a phone-sized viewport.

## Project Structure

### Documentation (this feature)

```text
specs/001-shared-coffee-queue/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── http-api.md
│   └── realtime-events.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── barista/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── orders/[orderId]/status/route.ts
│   │   │   └── sessions/route.ts
│   │   └── orders/route.ts
│   ├── barista/page.tsx
│   ├── order/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── barista/
│   ├── board/
│   └── order/
├── lib/
│   ├── auth/
│   ├── orders/
│   ├── supabase/
│   └── validation/
└── types/

supabase/
├── migrations/
└── seed.sql

tests/
├── e2e/
├── integration/
└── unit/
```

**Structure Decision**: Use one Next.js application rather than separate
frontend and backend projects. Route Handlers form the mutation boundary,
Server Components provide initial data, and focused Client Components subscribe
to realtime changes and manage interactions.

## Architecture Decisions

### Read and write boundaries

- Initial page data is loaded on the server.
- The public board subscribes to changes for the current session and refetches
  the authoritative active-board projection after relevant events.
- Public order creation goes through `POST /api/orders`; clients never receive a
  service-role key.
- All barista writes go through `/api/barista/*` and require the signed barista
  cookie.
- RLS remains enabled on all exposed tables. Direct anonymous table writes are
  denied.

### Barista PIN

- `BARISTA_PIN_HASH` and `BARISTA_SESSION_SECRET` are server-only environment
  variables.
- A successful PIN check creates a signed, HTTP-only, Secure, SameSite=Lax
  cookie with a short expiry (recommended: eight hours).
- The raw PIN is never stored in the database, browser storage, logs, or
  client-visible JavaScript.
- Login attempts receive basic per-client throttling. This is protection from
  casual access, not enterprise identity.

### Realtime synchronization

- Supabase Realtime Postgres Changes signals inserts and updates affecting the
  current session.
- Clients treat events as invalidation signals and refetch the board rather than
  relying on event payloads as the sole state source. This handles reconnects,
  authorization filtering, and missed events more safely.
- The client also refetches on window focus and Realtime reconnection.

### Ready-order expiration

- Marking an order Ready sets `ready_at`.
- Active-board reads include Ready orders only while
  `ready_at > current_time - 5 minutes`.
- Each open board schedules a timer for the nearest visible expiration and
  refetches then. Server filtering guarantees that a reload also hides expired
  cards.
- Records remain stored as completed history; no background scheduler is
  necessary for MVP correctness.

### Concurrency and undo

- Status mutation requests include the expected current status.
- The database update succeeds only when the stored status still matches that
  expectation, preventing duplicate taps or stale screens from skipping states.
- The API returns `409 Conflict` when another action already changed the order.
- Undo is available for 10 seconds and submits the inverse transition only if
  the order has not changed again.
- A partial unique index enforces at most one open coffee session.

## Post-Design Constitution Check

PASS. The data model, API contracts, and validation guide preserve the original
scope. The only added dependency beyond the core framework and Supabase is Zod,
which provides shared boundary validation. No unjustified complexity requires a
constitutional exception.

## Complexity Tracking

No constitution violations require justification.
