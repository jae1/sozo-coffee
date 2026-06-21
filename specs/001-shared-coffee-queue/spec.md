# Feature Specification: Shared Coffee Ordering Queue

**Feature Branch**: `main`

**Created**: 2026-06-20

**Status**: Draft

**Input**: A mobile coffee ordering page for home-church members and a live
order-taking queue for the friend preparing drinks.

## Clarifications

### Session 2026-06-20

- Q: How should the barista page be protected? → A: A shared four-digit PIN.
- Q: When should the active order board begin and end? → A: The barista manually
  opens and closes a coffee session whenever the group meets.
- Q: What happens if the barista closes a session with active orders? → A: Show
  a warning with the active-order count and close only after confirmation.
- Q: Which drink customizations are included in the first version? → A: Hot or
  iced, milk information for latte and mocha, and an optional preparation note.
- Q: Which milk choices are available initially? → A: Regular dairy milk only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Place a Coffee Order (Priority: P1)

A regular member opens the ordering page on their phone, selects their name,
chooses Americano, latte, or mocha, chooses hot or iced, sees that latte and
mocha use regular dairy milk, optionally adds a preparation note, and submits
the order without creating an account.

**Why this priority**: Capturing each person's drink without the barista asking
everyone individually is the product's central value.

**Independent Test**: A member can place an identifiable, preparation-ready
order from a phone and receive confirmation without any barista action.

**Acceptance Scenarios**:

1. **Given** the regular-member list is available, **When** a member selects
   their name and a valid drink configuration, **Then** the order is submitted
   under that first name with status `Just ordered`.
2. **Given** required drink choices are incomplete, **When** the member attempts
   to submit, **Then** the missing choices are explained and no incomplete order
   is created.
3. **Given** a visitor is not in the member list, **When** they choose the guest
   option and enter a temporary first name, **Then** they can place an order
   without creating a saved member profile.

---

### User Story 2 - Prepare Drinks from a Live Queue (Priority: P1)

The barista opens a coffee session whenever the group meets, sees incoming
orders with the member name and complete preparation details, starts each
drink, marks it ready using one clear action for each transition, and closes
the session when ordering is over.

**Why this priority**: Ordering only solves the coordination problem if the
barista receives an accurate, manageable preparation queue.

**Independent Test**: With several submitted orders, the barista can identify
what to make next and advance every drink from `Just ordered` to `In progress`
to `Ready`.

**Acceptance Scenarios**:

1. **Given** a member submits an order, **When** the barista views the active
   queue, **Then** the new order appears under `Just ordered` with all required
   preparation details.
2. **Given** an order is `Just ordered`, **When** the barista starts it, **Then**
   it moves to `In progress` and the shared board reflects the change.
3. **Given** an order is `In progress`, **When** the barista marks it ready,
   **Then** it moves to `Ready` and the shared board reflects the change.
4. **Given** no coffee session is open, **When** the barista opens one, **Then**
   participants can place orders into a new active board.
5. **Given** a coffee session has active orders, **When** the barista attempts
   to close it, **Then** the system shows the number of active orders and
   requires confirmation before closing.
6. **Given** the barista confirms session closure, **When** the session closes,
   **Then** new orders are refused while existing session orders remain
   available as history.

---

### User Story 3 - Watch the Shared Coffee Board (Priority: P2)

Any participant can view the complete active queue, organized like a coffee-shop
pickup board into `Just ordered`, `In progress`, and `Ready`.

**Why this priority**: The board lets members follow progress without interrupting
the barista and adds a playful shared experience.

**Independent Test**: Participants can observe multiple orders change categories
and can tell which drinks are ready without asking the barista.

**Acceptance Scenarios**:

1. **Given** active orders exist in different states, **When** a participant
   opens the board, **Then** all active orders are grouped under the correct
   status using first names only.
2. **Given** an order has been marked `Ready`, **When** five minutes pass,
   **Then** it disappears from the active board without barista action and is
   retained as completed history.
3. **Given** the board is already open, **When** an order is submitted or its
   status changes, **Then** the board reflects the change without requiring a
   manual refresh.

### Edge Cases

- Two members submit orders at nearly the same time.
- A participant accidentally selects another member's name.
- Two active orders have the same first name.
- The same member submits more than one active order.
- A temporary connection loss occurs during submission or a status update.
- The barista taps a status action accidentally.
- A Ready order reaches its automatic removal time while a board is open.
- There are no active orders in one or more board columns.
- A participant opens the ordering page while no coffee session is active.
- The barista closes a session while drinks remain active.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide separate member-ordering and barista-queue
  experiences over the same set of active orders.
- **FR-002**: A regular member MUST be able to identify themselves by selecting
  their first name from a predefined list without logging in.
- **FR-003**: The system MUST remember the selected regular member on that
  device so future visits do not require re-selection, while allowing the
  selection to be changed.
- **FR-004**: A guest MUST be able to enter a temporary first name and order
  without creating a persistent guest profile.
- **FR-005**: Members MUST be able to choose Americano, latte, or mocha.
- **FR-006**: Every drink MUST offer hot and iced preparation.
- **FR-007**: Latte and mocha orders MUST use regular dairy milk; because no
  alternative milk is initially available, the ordering flow MUST communicate
  this without requiring a redundant milk selection. Americano orders MUST NOT
  display a milk choice.
- **FR-008**: A submitted order MUST record the displayed customer name, drink,
  preparation choices, submission time, and current status.
- **FR-009**: Every new order MUST begin in `Just ordered`.
- **FR-010**: The barista MUST be able to move an order from `Just ordered` to
  `In progress` with one action.
- **FR-011**: The barista MUST be able to move an order from `In progress` to
  `Ready` with one action.
- **FR-012**: The barista MUST be offered a short-lived undo action after a
  status change.
- **FR-013**: All participants MUST be able to view all active orders grouped
  into `Just ordered`, `In progress`, and `Ready`.
- **FR-014**: The shared board MUST display only the customer first name and
  order information needed to understand progress.
- **FR-015**: Order submissions and status changes MUST appear on already-open
  member and barista views without manual refresh.
- **FR-016**: A Ready order MUST remain visible for five minutes and then be
  automatically removed from the active board and recorded as completed.
- **FR-017**: The barista experience MUST require a shared four-digit PIN before
  allowing access to queue-management actions.
- **FR-018**: Failed submissions or status updates MUST clearly state whether
  the action succeeded and MUST avoid silently creating duplicate changes.
- **FR-019**: The active board MUST show a clear empty state when no orders
  exist in a status group or on the entire board.
- **FR-020**: The barista MUST be able to manually open a new coffee session and
  close the current coffee session.
- **FR-021**: The system MUST accept member orders only while a coffee session
  is open and MUST clearly explain when ordering is closed.
- **FR-022**: Each order MUST belong to exactly one coffee session, and opening
  a new session MUST provide a new active board without deleting prior session
  history.
- **FR-023**: If active orders remain when the barista requests session closure,
  the system MUST show their count and require explicit confirmation before
  closing.
- **FR-024**: A member MUST be able to add an optional preparation note to an
  order.
- **FR-025**: The first version MUST NOT offer size, sweetness, extra-shot, or
  decaffeination controls.

### Key Entities

- **Member**: A predefined regular participant identified by a display first
  name and an active/inactive state.
- **Guest Identity**: A temporary display first name attached to an order and
  not retained as a reusable member profile.
- **Menu Item**: A drink offered for ordering, including its name and permitted
  preparation choices.
- **Order**: A member's or guest's drink request, including preparation details,
  submission time, current status, status times, and completion time.
- **Coffee Session**: A barista-controlled ordering period with an opening time,
  optional closing time, lifecycle state, and its associated orders.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of regular members can place a valid order on their
  first attempt without assistance.
- **SC-002**: A returning regular member can place a standard drink order in
  under 30 seconds.
- **SC-003**: A barista can identify the next drink and advance its status with
  no more than one action per transition.
- **SC-004**: New orders and status changes become visible on other open screens
  within two seconds during normal connectivity.
- **SC-005**: The system handles at least 20 active orders without losing,
  duplicating, or misclassifying an order.
- **SC-006**: Every order marked Ready leaves the active board automatically
  within five minutes and 10 seconds, without barista cleanup.
- **SC-007**: In a gathering trial, members can determine whether their drink is
  waiting, being made, or ready without asking the barista.

## Assumptions

- The initial community contains nine predefined regular members and occasional
  guests.
- First names provide sufficient identity in this trusted small-community
  setting; duplicate first names may be disambiguated by a short label.
- Participants have phones with a modern browser and normal internet access at
  the gathering.
- The barista and any trusted substitute may use the shared PIN; individual
  barista accounts and audit attribution are outside the first version.
- Editing, canceling, saved usuals, notifications, inventory, payments, and
  analytics are outside this first feature unless added through a later spec.
