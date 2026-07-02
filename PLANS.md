# PLANS.md

This roadmap describes project sequencing. It is not an implementation plan.

## Phase 0: Foundation

Goal: establish the product, brand, and decision framework.

Milestones:

- Brand foundation defined in `BRAND_DNA.md`.
- Product scope documented in `PROJECT.md`.
- Design direction documented in `DESIGN_DIRECTION.md`.
- Reference interpretation documented in `VISUAL_ANALYSIS.md`.
- Current work process documented in `AGENTS.md` and `TASK.md`.

Dependencies:

- None.

## Phase 1: Business And Compliance Decisions

Goal: resolve the requirements that affect payments, legality, and public trust.

Milestones:

- Legal entity and country confirmed.
- Payment-provider requirements confirmed.
- Compliance requirements documented.
- Refund, failure, and dispute policies defined.
- Supported countries and currencies decided.
- Launch product categories confirmed.
- Minimum operations and support requirements confirmed.

Dependencies:

- Phase 0 documents.

## Phase 2: Supplier And Fulfillment Definition

Goal: define how products are sourced, priced, and delivered.

Milestones:

- Supplier API list finalized.
- Steam integration method selected.
- Product data ownership and usage rights clarified.
- Price, stock, and availability update model defined.
- Order status model defined.
- User-facing fulfillment states defined.
- Failure and rollback behavior defined.
- Mixed-cart policy confirmed.

Dependencies:

- Phase 1 decisions.
- Input from the technical stakeholder responsible for supplier integrations.

## Phase 3: Product Specification

Goal: convert business and fulfillment decisions into a precise product specification.

Milestones:

- User stories and acceptance criteria.
- Data model outline.
- Checkout and balance rules.
- Account requirements.
- Catalog requirements.
- Support and legal content requirements.
- Admin and operations scope decision.

Dependencies:

- Phase 1 and Phase 2 decisions.

## Phase 4: Experience Design

Goal: define flows and screen-level behavior before visual production.

Milestones:

- Information architecture validated.
- User journeys mapped.
- Checkout, balance, and fulfillment states specified.
- Empty, loading, error, failed, refunded, and completed states specified.
- Accessibility and responsive requirements defined.

Dependencies:

- Phase 3 specification.
- `BRAND_DNA.md` and `DESIGN_DIRECTION.md`.

## Phase 5: Visual System

Goal: create a durable visual system aligned with Locker identity.

Milestones:

- Typography direction.
- Color tokens.
- Spacing and layout rhythm.
- Product imagery rules.
- Iconography rules.
- Motion principles.
- Design quality checklist.

Dependencies:

- Phase 4 experience decisions.
- `VISUAL_ANALYSIS.md`.

## Phase 6: Implementation Planning

Goal: plan the technical build after product and design decisions are stable.

Milestones:

- Technical architecture plan.
- Framework and hosting decisions.
- Database and service boundaries.
- API integration plan.
- QA and verification plan.
- Delivery milestones.

Dependencies:

- Approved product specification.
- Approved experience design.
- Approved visual system.

## Phase 7: Build And Verification

Goal: implement the approved product in controlled increments.

Milestones:

- Project initialization.
- Core app shell.
- Catalog.
- Auth and profile.
- Balance top-up.
- Cart and checkout.
- Provider fulfillment.
- Purchase history.
- Legal and support pages.
- QA, accessibility, performance, and production readiness.

Dependencies:

- Explicit approval to leave Planning Mode.
