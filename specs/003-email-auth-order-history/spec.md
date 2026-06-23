# Feature Specification: Email Authentication and Order History

**Created**: 2026-06-22
**Status**: In progress

## User Scenarios & Testing

### User Story 1 - Sign in from the home page (P1)

As a customer, I open Sozo Coffee and immediately see a focused email and password sign-in page.

**Acceptance Scenarios**

1. A signed-out visitor sees no marketing landing page.
2. A visitor can sign in, create an account, or request a password reset using email.
3. A signed-in customer opening the home page is sent to ordering.

### User Story 2 - Place orders as an authenticated customer (P1)

As a signed-in customer, my orders are automatically associated with my account.

**Acceptance Scenarios**

1. The ordering page uses the signed-in profile name and does not ask for identity.
2. Each submitted drink is saved with the authenticated user.
3. A signed-out request cannot create an account-owned order.

### User Story 3 - Review order history and favorites (P2)

As a customer, I can see my previous drinks and the combinations I order most often.

**Acceptance Scenarios**

1. The account page lists only the signed-in customer’s orders, newest first.
2. Frequently ordered drink and temperature combinations are ranked by count.
3. An account with no orders receives a clear empty state.

## Requirements

- **FR-001**: Authentication must use Supabase email and password accounts.
- **FR-002**: Auth sessions must persist safely across browser and server rendering.
- **FR-003**: New accounts must create a member profile with a display name.
- **FR-004**: Orders must record the authenticated user ID.
- **FR-005**: Order history must remain available after café sessions close.
- **FR-006**: Users must only access their own private history.
- **FR-007**: Existing staff roles must continue to control barista access.
- **FR-008**: The existing landing page must be replaced, not deleted until implementation is validated.

## Success Criteria

- A customer can sign up, sign in, and reach ordering without username or PIN.
- Every new authenticated order appears in that customer’s history.
- Favorite combinations reflect accumulated order counts.
- Direct access to another customer’s history is not possible.
