# HTTP Contract

All request and response bodies use JSON unless noted. Error responses use:

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "Human-readable explanation"
  }
}
```

## Public reads

### `GET /api/board`

Returns the open session, public member choices, menu, and active orders.
Expired Ready orders are excluded.

Response `200`:

```json
{
  "session": { "id": "uuid", "status": "open" },
  "members": [{ "id": "uuid", "displayName": "Grace" }],
  "menu": [
    { "id": "americano", "displayName": "Americano", "usesDairyMilk": false }
  ],
  "orders": [
    {
      "id": "uuid",
      "customerName": "Grace",
      "drink": "Latte",
      "temperature": "iced",
      "milk": "dairy",
      "note": null,
      "status": "ordered",
      "orderedAt": "ISO-8601 timestamp",
      "readyAt": null
    }
  ]
}
```

When no session is open, `session` is `null` and `orders` is empty.

## Public mutations

### `POST /api/orders`

Creates an order in the currently open session.

Request:

```json
{
  "requestId": "client-generated-uuid",
  "identity": { "type": "member", "memberId": "uuid" },
  "menuItemId": "latte",
  "temperature": "iced",
  "note": "Less ice"
}
```

Guest identity:

```json
{
  "identity": { "type": "guest", "name": "Sam" }
}
```

Responses:

- `201 Created`: created order
- `400 Bad Request`: invalid fields
- `409 Conflict`: no session is open or duplicate `requestId`
- `429 Too Many Requests`: submission limit exceeded

## Barista authentication

### `POST /api/barista/login`

Request:

```json
{ "pin": "1234" }
```

Responses:

- `204 No Content`: signed cookie created
- `400 Bad Request`: PIN is not exactly four digits
- `401 Unauthorized`: PIN does not match
- `429 Too Many Requests`: retry later

### `POST /api/barista/logout`

Clears the barista cookie. Returns `204 No Content`.

## Coffee sessions

### `POST /api/barista/sessions`

Requires the barista cookie. Opens a new session.

Responses:

- `201 Created`: new session
- `409 Conflict`: a session is already open

### `PATCH /api/barista/sessions/current`

Requires the barista cookie.

Request:

```json
{ "action": "close", "confirmActiveOrders": true }
```

Responses:

- `200 OK`: session closed
- `409 Conflict`: active orders remain and confirmation is false; response
  includes `activeOrderCount`

## Order status

### `PATCH /api/barista/orders/{orderId}/status`

Requires the barista cookie.

Request:

```json
{
  "from": "ordered",
  "to": "in_progress"
}
```

Allowed transitions:

- `ordered` → `in_progress`
- `in_progress` → `ready`
- inverse of the immediately preceding transition within 10 seconds

Responses:

- `200 OK`: updated order and `undoUntil`
- `400 Bad Request`: invalid transition
- `404 Not Found`: order is not in the current session
- `409 Conflict`: stored status no longer equals `from`

## Security and validation rules

- Service-role credentials are used only by server handlers.
- The raw PIN must never appear in response bodies or logs.
- All string lengths, enum values, identities, active menu items, and active
  session constraints are validated server-side.
- Mutation responses set `Cache-Control: no-store`.
