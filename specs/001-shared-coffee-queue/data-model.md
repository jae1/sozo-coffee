# Data Model: Shared Coffee Ordering Queue

## Member

Represents one regular home-church participant.

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `display_name` | Text | Required, trimmed, 1–40 characters |
| `disambiguator` | Text, nullable | Short label used only for duplicate names |
| `is_active` | Boolean | Defaults true |
| `sort_order` | Integer | Stable ordering in the name picker |
| `created_at` | Timestamp | Server generated |

Public member reads expose only `id`, display label, and ordering position.

## Coffee Session

Represents one barista-controlled ordering period.

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `status` | Enum | `open` or `closed` |
| `opened_at` | Timestamp | Required, server generated |
| `closed_at` | Timestamp, nullable | Required when status is `closed` |
| `created_at` | Timestamp | Server generated |

Constraints:

- At most one row may have `status = open`.
- A closed session cannot be reopened in MVP.
- Opening a session never deletes previous sessions or orders.

State transition:

```text
open → closed
```

## Menu Item

Represents a drink the barista currently offers.

| Field | Type | Rules |
|---|---|---|
| `id` | Text | Stable values: `americano`, `latte`, `mocha` |
| `display_name` | Text | Required |
| `is_active` | Boolean | Defaults true |
| `uses_dairy_milk` | Boolean | False for Americano; true otherwise |
| `sort_order` | Integer | Stable menu order |

The first version seeds all three items and does not expose menu administration.

## Order

Represents one drink request within one coffee session.

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | Primary key |
| `session_id` | UUID | Required foreign key to Coffee Session |
| `member_id` | UUID, nullable | Set for a regular member |
| `customer_name` | Text | Required snapshot, trimmed, 1–40 characters |
| `is_guest` | Boolean | True only when no member profile is used |
| `menu_item_id` | Text | Required foreign key to Menu Item |
| `temperature` | Enum | `hot` or `iced` |
| `milk` | Enum, nullable | `dairy` for latte/mocha; null for Americano |
| `note` | Text, nullable | Trimmed, maximum 120 characters |
| `status` | Enum | `ordered`, `in_progress`, `ready` |
| `ordered_at` | Timestamp | Required, server generated |
| `started_at` | Timestamp, nullable | Set on first transition |
| `ready_at` | Timestamp, nullable | Set on Ready transition |
| `updated_at` | Timestamp | Updated for every mutation |

Validation:

- Orders may be created only for the currently open session.
- Exactly one identity mode is used: active `member_id`, or guest name.
- `customer_name` is copied onto the order so history remains readable if a
  member label later changes.
- Latte and mocha require `milk = dairy`; Americano requires `milk = null`.
- An order cannot skip or reverse states except through the 10-second undo rule.
- Ready orders remain active only while `ready_at` is less than five minutes
  old.

State transitions:

```text
ordered → in_progress → ready
            ↑  undo       ↑
            └─────────────┘ (inverse only within undo window)
```

For implementation, each mutation uses a conditional update on the expected
current status. This makes concurrent taps deterministic.

## Barista Session

This is represented by a signed browser cookie rather than a database entity.

Claims:

| Claim | Rule |
|---|---|
| `role` | Fixed value `barista` |
| `issued_at` | Server timestamp |
| `expires_at` | Eight hours after issuance |

The cookie is HTTP-only, Secure in production, SameSite=Lax, signed with a
server-only secret, and contains no raw PIN.

## Relationships

```text
Member 0..1 ───< Order >─── 1 Menu Item
                     │
                     └────── 1 Coffee Session
```

- A Coffee Session has zero or many Orders.
- A Member has zero or many Orders over time.
- Guest orders have no Member relationship but retain a customer-name snapshot.
