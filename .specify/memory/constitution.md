<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles:
  - I. Hospitality Before Commerce
  - II. Fast, Mobile-First Ordering
  - III. A Calm Barista Queue
  - IV. Shared, Private-by-Context Experience
  - V. Small and Reliable
- Added sections:
  - Product Boundaries
  - Delivery and Quality Gates
- Templates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md (compatible without changes)
  - ✅ .specify/templates/tasks-template.md (compatible without changes)
- Follow-up TODOs: none
-->
# Sozo Coffee Constitution

## Core Principles

### I. Hospitality Before Commerce
Sozo Coffee MUST make serving friends easier and warmer. Product decisions MUST
optimize for hospitality, clarity, and shared enjoyment rather than sales,
engagement, or commercial workflows. Payments, tipping, pricing, promotions,
and marketplace behavior are outside the product unless the constitution is
formally amended.

### II. Fast, Mobile-First Ordering
Every member-facing flow MUST work comfortably on a phone and MUST minimize
typing and repeated choices. A returning member MUST be able to identify
themselves, choose a drink, and place an order in under 30 seconds during normal
use. The interface MUST remain understandable without onboarding or technical
help.

### III. A Calm Barista Queue
The barista view MUST reduce memory, coordination, and tapping burden. Each
active order MUST clearly show the member, drink, preparation details, and
current state. The core workflow MUST require no more than one deliberate action
to advance an order from each state to the next. Nonessential cleanup, including
removing ready drinks from the active board, MUST be automatic.

### IV. Shared, Private-by-Context Experience
The active queue MUST be visible to gathering participants using first names
only, creating a playful shared coffee-board experience. The application MUST
not require member accounts for the initial product. Personal data MUST be
limited to what is needed to identify and prepare an order, and the barista
experience MUST not be publicly discoverable or casually accessible.

### V. Small and Reliable
The product MUST be designed for a home church of roughly nine regular members
and occasional guests. New capabilities MUST solve an observed gathering need;
speculative complexity is rejected. Core order placement and status updates
MUST be tested as complete user journeys, including synchronization between the
member and barista experiences.

## Product Boundaries

- The initial menu consists of Americano, latte, and mocha, each hot or iced.
- The product has two primary experiences: member ordering and barista queue
  management.
- The active lifecycle is `Just ordered` → `In progress` → `Ready` →
  automatically archived.
- The product MUST support regular members by name and MAY support temporary
  guest names without creating saved guest profiles.
- Inventory management, payments, tipping, delivery logistics, loyalty,
  analytics, and public customer acquisition are out of scope.
- Accessibility, readable touch targets, clear status language, and graceful
  error recovery are required parts of the experience, not optional polish.

## Delivery and Quality Gates

- Each feature MUST begin with testable user scenarios and technology-independent
  requirements before implementation planning.
- Plans MUST explicitly verify mobile usability, barista action count, privacy,
  scope simplicity, and end-to-end order synchronization.
- Implementation tasks MUST preserve independently testable member and barista
  journeys and include tests for the shared order lifecycle.
- Any added dependency, service, or architectural layer MUST have a concrete
  need in the approved specification.
- A feature is not complete until its acceptance scenarios have been exercised
  on a phone-sized viewport and the barista queue has been tested under multiple
  simultaneous orders.

## Governance

This constitution is the highest-priority project guidance. Specifications,
plans, and tasks MUST comply with it. Amendments require a documented rationale,
an impact review of existing artifacts, and a semantic version change: MAJOR for
incompatible principle changes, MINOR for new or materially expanded principles,
and PATCH for clarifications. Every implementation plan MUST include a
Constitution Check before design and again before implementation. Unjustified
complexity or scope expansion MUST block implementation until resolved.

**Version**: 1.0.0 | **Ratified**: 2026-06-20 | **Last Amended**: 2026-06-20
