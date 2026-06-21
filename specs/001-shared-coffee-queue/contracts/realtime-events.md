# Realtime Contract

## Channel

Open pages subscribe to database changes relevant to the current Coffee Session.

The client listens for:

- Order `INSERT`
- Order `UPDATE`
- Coffee Session `INSERT`
- Coffee Session `UPDATE`

## Client behavior

Realtime messages are invalidation signals, not the authoritative board state.
After a relevant message, the client debounces and refetches `GET /api/board`.

The client also refetches:

- after reconnecting to Realtime;
- when the page becomes visible after being hidden;
- after its own successful mutation;
- when the nearest visible Ready card reaches its five-minute expiration.

## Ordering and duplicate events

- Clients MUST tolerate repeated, delayed, or out-of-order events.
- The refetched server projection determines final ordering and status.
- Orders display oldest-first within `ordered` and `in_progress`; Ready orders
  display most-recently-ready first.

## Degraded behavior

If the Realtime connection fails:

- Keep the last confirmed board visible with a reconnecting indicator.
- Retry the subscription with backoff.
- Refetch after reconnection.
- Mutation responses still update the initiating screen immediately.

The two-second target applies under normal connectivity, not while a device is
offline.
