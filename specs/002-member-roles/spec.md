# Feature Specification: Member Roles

**Created**: 2026-06-22
**Status**: Implemented

## User Scenarios & Testing

### User Story 1 - Customers see only customer features

As a customer, I can order coffee without seeing staff-only navigation or controls.

**Acceptance Scenarios**

1. Given a customer is signed in, when they visit the home page, then no barista link is shown.
2. Given a customer knows the barista URL, when they open it, then they are redirected to their account page.
3. Given a customer calls a barista mutation directly, then the request is rejected.

### User Story 2 - Baristas manage orders

As a barista, I can open the barista station and manage café sessions and order status.

**Acceptance Scenarios**

1. Given a barista is signed in, when they visit the home or account page, then a barista link is available.
2. Given a barista opens the barista station, then they can open and close the café and advance orders.

### User Story 3 - Administrators assign roles

As an administrator, I can assign customer, barista, or administrator access to registered members.

**Acceptance Scenarios**

1. Given an administrator opens their account page, then all registered accounts and current roles are listed.
2. Given an administrator changes a role, then future page loads and protected requests use the new role.
3. Given an administrator attempts to remove their own administrator role, then the change is rejected.

## Requirements

- **FR-001**: Every registered account must have exactly one role: customer, barista, or administrator.
- **FR-002**: New accounts must receive the customer role.
- **FR-003**: Only baristas and administrators may access the barista station.
- **FR-004**: Every barista mutation must independently verify current server-side role data.
- **FR-005**: Only administrators may view and change account roles.
- **FR-006**: The active administrator must not be able to remove their own administrator access.
- **FR-007**: Role changes must take effect without requiring the affected member to sign out.
- **FR-008**: Staff navigation must remain hidden from customers.

## Key Entities

- **Member Account**: A registered member identity with one current role.
- **Role**: Customer, barista, or administrator access level.

## Assumptions

- The existing `herojae1` account is the initial administrator.
- An administrator will assign the barista role to the coffee maker after deployment.
- Multiple administrators are allowed.

## Success Criteria

- Customers cannot perform any staff mutation, including by directly calling its URL.
- Baristas can reach all existing order-management functions.
- Administrators can change a member role from the account page in one action.
- A changed role is enforced on the affected member’s next request.
