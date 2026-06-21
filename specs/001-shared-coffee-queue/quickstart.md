# Quickstart and Validation Guide

This guide describes how the finished feature will be run and proven. Commands
become executable after implementation tasks create the application.

## Prerequisites

- Node.js 20.9 or newer
- npm
- A Supabase project for development
- Supabase project URL, publishable key, and server-only service-role key
- Server-only barista PIN hash and cookie-signing secret

## Environment

Create `.env.local` from the implementation-provided `.env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BARISTA_PIN_HASH=
BARISTA_SESSION_SECRET=
```

Never commit `.env.local`.

## Database setup

Apply migrations and seed the nine members and three menu items using the
project's Supabase migration workflow. Confirm RLS is enabled and anonymous
direct writes are denied.

## Run locally

```bash
npm install
npm run dev
```

Open:

- Member ordering: `http://localhost:3000/order`
- Barista queue: `http://localhost:3000/barista`

## Automated checks

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

## Required end-to-end validation

### Scenario 1: Open and close a session

1. Open `/barista` and enter an incorrect PIN; access is refused.
2. Enter the configured four-digit PIN.
3. Open a coffee session.
4. Verify `/order` changes from ordering-closed to the menu.
5. Close the empty session and verify new orders are refused.

### Scenario 2: Member order reaches the barista

1. Open `/order` in a phone-sized browser viewport.
2. Select a regular member and order an iced latte with a note.
3. Verify submission completes in fewer than 30 seconds.
4. In a separate browser context, verify the card appears under Just ordered
   within two seconds.

### Scenario 3: Barista lifecycle and shared board

1. Start the order; verify both contexts show In progress.
2. Mark it Ready; verify both contexts show Ready.
3. Use a test clock or configured short test duration to cross the expiration
   boundary.
4. Verify the Ready card disappears without another barista action.

### Scenario 4: Concurrent safety

1. Submit several orders nearly simultaneously.
2. Trigger the same transition from two barista tabs.
3. Verify exactly one succeeds and the other receives a conflict message.
4. Verify no order is lost, duplicated, or skips a state.

### Scenario 5: Closing with active orders

1. Leave at least one order in Just ordered or In progress.
2. Attempt to close the session.
3. Verify the warning shows the active-order count.
4. Cancel once, then confirm; verify the session closes and history remains.

## Manual mobile review

- Touch targets are at least 44 by 44 CSS pixels.
- Order text remains readable at 320 CSS pixels wide.
- Keyboard focus is visible and status is not conveyed by color alone.
- Loading, empty, reconnecting, failure, and closed-session states are clear.
