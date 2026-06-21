# Research: Shared Coffee Ordering Queue

## Next.js application model

**Decision**: Use Next.js 16 App Router with TypeScript, Server Components for
initial reads, Client Components for interactive/realtime regions, and Route
Handlers for mutations.

**Rationale**: One deployable application can serve the member and barista
experiences while keeping PIN verification and privileged database access on the
server. The App Router is the current Next.js application model and Route
Handlers provide standard HTTP request handlers inside the same project.

**Alternatives considered**:

- Vite SPA plus separate API: adds a second deployable service without user
  value at this scale.
- Client-only Supabase app: simpler initially, but awkward for securely
  separating anonymous order creation from PIN-protected barista mutations.

## Database and realtime service

**Decision**: Use Supabase Postgres with Realtime Postgres Changes and RLS.

**Rationale**: The product needs durable relational state and updates across
several phones. Postgres naturally models sessions and orders, while Realtime
removes polling delay. RLS provides a second boundary if browser clients access
read projections.

**Alternatives considered**:

- Firebase: capable, but the relational session/order lifecycle is a more direct
  fit for Postgres.
- In-memory or file storage: unsuitable for serverless deployment and multiple
  simultaneous devices.
- Periodic polling only: workable, but less playful and less responsive than
  the required two-second shared board.

## Public access without member accounts

**Decision**: Permit limited public board reads, but route all writes through
validated server handlers. Keep RLS enabled and deny anonymous direct writes.

**Rationale**: Members intentionally have no accounts. A narrow server mutation
boundary lets the app enforce active-session, menu, status, length, and
idempotency rules without exposing privileged credentials.

**Alternatives considered**:

- Full Supabase Auth for every member: excessive friction for nine trusted
  participants.
- Anonymous direct inserts: fewer files, but weaker abuse controls and business
  rule enforcement.

## Shared PIN protection

**Decision**: Verify a hashed four-digit PIN on the server and issue a signed,
HTTP-only barista session cookie.

**Rationale**: This meets the agreed “casual access” threat model without asking
the barista to maintain an account. The cookie keeps the raw PIN out of normal
subsequent requests and client storage.

**Alternatives considered**:

- Secret URL: easily forwarded and difficult to revoke selectively.
- PIN stored in browser JavaScript: inspectable and unsuitable as an access
  control.
- Full user authentication: disproportionate to the home-church use case.

## Ready-order expiration

**Decision**: Derive active visibility from `ready_at` and current time; use
client timers to refresh at the five-minute boundary.

**Rationale**: The requirement is that cards disappear, not that rows be
physically modified at exactly five minutes. Query-time filtering is reliable
after reloads and avoids a cron or background worker.

**Alternatives considered**:

- Scheduled database job: adds operational setup for no MVP benefit.
- Client-only hiding: fails to provide an authoritative result after reconnects
  and can vary between devices.

## Testing strategy

**Decision**: Use Vitest and React Testing Library for fast validation logic and
component behavior; use Playwright for the member-to-barista-to-board lifecycle.

**Rationale**: The highest-risk behavior spans two browser contexts, realtime
updates, a mobile viewport, and time-based disappearance. End-to-end browser
tests directly exercise those guarantees.

**Alternatives considered**:

- Unit tests only: cannot validate the shared live workflow.
- Manual testing only: too easy to regress status, session, and expiration
  behavior.

## Styling and deployment

**Decision**: Tailwind CSS 4 for focused responsive styling and Vercel for the
Next.js deployment.

**Rationale**: This keeps the UI implementation compact and follows the natural
deployment path for a Next.js App Router application. Supabase remains the
managed data service.

**Alternatives considered**:

- Large component system: unnecessary weight and visual constraints for three
  small screens.
- Native mobile applications: installation and dual-platform maintenance
  conflict with the link-first product goal.

## Primary references

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
