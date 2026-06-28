# Feature Specification: Mobile UI Consistency and Usability

**Feature Branch**: `004-mobile-ui-consistency`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Apply GitHub Spec Kit and stop ad hoc UI changes. Review and fix the whole app so mobile-first screens are consistent, readable, and not broken across ordering, account, admin, and barista pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Order on a phone without visual breakage (Priority: P1)

As a signed-in member using a phone, I can open the ordering page and place an order without clipped text, broken headers, overlapping controls, or confusing account actions.

**Why this priority**: Ordering is the primary member flow and the constitution requires comfortable phone use and order completion in under 30 seconds.

**Independent Test**: Sign in as a member on a 390px-wide viewport, open ordering, choose a drink and temperature, add it to the order, and place the order. The header remains one row, the hero title is not clipped, controls fit their containers, and the primary action remains visible.

**Acceptance Scenarios**:

1. **Given** a signed-in member on a phone-sized viewport, **When** they open the ordering page, **Then** the header shows the brand and compact account access without wrapping into multiple rows.
2. **Given** the ordering page on a phone-sized viewport, **When** the page renders, **Then** hero text and tabs are fully visible without clipped characters or overlap.
3. **Given** a member has selected a drink, **When** they add it to the order, **Then** the mobile bottom bar summarizes the order and the place-order action remains reachable.

---

### User Story 2 - Manage roles without broken mobile admin UI (Priority: P1)

As an admin using a phone, I can manage member roles from a consistent admin page without native dropdown popovers, overlapping header buttons, or truncated member rows.

**Why this priority**: Admin access is required to recover staff permissions and the current mobile admin layout exposed severe visual and interaction defects.

**Independent Test**: Sign in as an admin on a 390px-wide viewport and open the admin page. Confirm page actions are below the header, each member row fits the viewport, and role changes use in-page segmented buttons instead of native select popovers.

**Acceptance Scenarios**:

1. **Given** an admin on a phone-sized viewport, **When** they open the admin page, **Then** the header contains only the brand, with admin actions placed in a body toolbar.
2. **Given** the admin member list, **When** the admin reviews rows, **Then** names, account identifiers, and role controls remain readable without horizontal overflow.
3. **Given** the admin changes a member role, **When** they tap a role option, **Then** the role changes through an in-page segmented control with clear selected state and no OS dropdown overlay.
4. **Given** the admin sees their own member row, **When** the row renders, **Then** it shows a non-interactive current-role badge and explains that the admin cannot change their own role.

---

### User Story 3 - Use account and barista pages with one visual system (Priority: P2)

As a staff member, I can move between account, admin, ordering, and barista pages and feel like they belong to one app, with consistent typography, spacing, cards, and actions.

**Why this priority**: Staff/admin users cross multiple pages in one session; inconsistent UI undermines trust and increases operational friction.

**Independent Test**: Sign in as an admin, visit account, admin, barista, and ordering pages on desktop and phone-sized viewports. Confirm common header, page heading scale, toolbar placement, card radius, and button sizing are consistent.

**Acceptance Scenarios**:

1. **Given** any authenticated app page, **When** the page renders, **Then** page titles use the shared title scale and no negative letter spacing or clipped line height appears.
2. **Given** a page has secondary navigation or management actions, **When** it renders on mobile, **Then** those actions appear in a body toolbar or hub cards rather than crowding the header.
3. **Given** the barista board on a phone-sized viewport, **When** orders are present, **Then** the primary order transition remains a large button and drag-and-drop hints do not dominate mobile usage.

### Edge Cases

- Long display names must not force header wrapping or horizontal page overflow.
- Multiple admin actions must stack in the body toolbar on mobile instead of competing with the brand.
- Empty states must use the same card and typography system as populated states.
- Role controls must remain usable for three roles without relying on hover or desktop-only behavior.
- The app must still support desktop layouts without stretching admin cards across the full viewport.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The authenticated app header MUST use one shared brand-only structure for brand mark and app name across order, account, admin, and barista pages.
- **FR-002**: Mobile headers MUST remain a single row and MUST NOT contain multi-button page action groups.
- **FR-003**: Pages with secondary or management actions MUST render those actions outside the header as either a body toolbar or hub cards that stack cleanly on phone-sized viewports.
- **FR-004**: The ordering page MUST avoid clipped hero/title text and overlapping sticky elements on phone-sized viewports.
- **FR-005**: The ordering page MUST keep the active order summary and place-order action reachable on phone-sized viewports.
- **FR-006**: The admin role control MUST use an in-page touch-friendly control and MUST NOT rely on native select dropdown popovers for role changes.
- **FR-007**: Admin member rows MUST display identity and role state without horizontal overflow on phone-sized viewports.
- **FR-012**: The admin page MUST NOT present an interactive role-change control for the currently signed-in admin.
- **FR-008**: Account history, status board, admin cards, and barista lists MUST use a consistent card radius, spacing scale, and title scale.
- **FR-009**: The UI MUST NOT use negative letter spacing or sub-1 line heights for app/page titles.
- **FR-010**: The barista mobile view MUST preserve one-tap order advancement as the primary interaction.
- **FR-011**: Validation MUST include phone-sized viewport checks for ordering, account, admin, and barista pages.
- **FR-013**: Authenticated pages MUST NOT repeat the same navigation action or section label in both the header and page body; each user action should appear once in the most relevant location.

### Key Entities

- **App Header**: Shared authenticated page header with brand mark, app name, and optional compact account access.
- **Page Toolbar**: Body-level action area for page-specific commands such as admin navigation, order navigation, and café open/close.
- **Role Control**: In-page segmented role selector for customer, barista, and admin states.
- **Status/Card Surface**: Shared card/list presentation used by account history, order status, admin members, and barista queue.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a 390px-wide viewport, order, account, admin, and barista pages render with zero horizontal overflow.
- **SC-002**: On a 390px-wide viewport, no page title, hero title, button label, or member row text is visually clipped at first render.
- **SC-003**: A signed-in member can place a standard drink order on a phone-sized viewport in under 30 seconds after reaching the order page.
- **SC-004**: An admin can change a non-self member role on a phone-sized viewport without triggering a native select dropdown.
- **SC-005**: Header height remains stable across order, account, admin, and barista pages on mobile after initial render.
- **SC-006**: Manual visual review confirms the same typography scale, card radius, and toolbar placement across all authenticated pages.

## Assumptions

- The existing Next.js, Supabase Auth, and role model remain in place.
- Visual validation may use local test accounts and local development data.
- Desktop support remains required, but mobile phone-sized viewport behavior is the primary design constraint.
- Glassmorphism may be used only where it preserves contrast, readability, and touch clarity.
