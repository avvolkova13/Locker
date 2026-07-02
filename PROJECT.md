# PROJECT.md

Locker is a premium account-centered marketplace for digital goods. It should help users browse products, add funds to an internal balance, buy digital goods, receive them through supplier integrations, and track purchase history.

Brand identity is defined in `BRAND_DNA.md` and must guide all product, UX, design, and engineering decisions.

## Product Overview

Locker sells digital goods to individual users.

Initial product categories:

- Steam Wallet top-ups.
- Game skins for CS2, CS:GO, Dota 2, and Rust.
- ChatGPT subscription products, pending business and compliance approval.
- Future digital goods categories.

The long-term product model is a personal digital goods account, not a single-category storefront.

## Scope

In scope for the initial product:

- Public home experience.
- Product catalog.
- Product detail.
- Cart.
- Registration and authorization.
- Profile.
- Internal balance top-up.
- Purchase history.
- FAQ.
- Contacts.
- Legal pages: user agreement, privacy policy, cookie policy.
- Supplier-based digital goods fulfillment.

Out of scope until explicitly approved:

- User-to-user marketplace.
- Balance withdrawals.
- Loyalty program.
- Mobile app.
- Community features.
- Advanced personalization.
- Full admin system.

A minimum operations surface is still required for launch planning: staff must be able to identify orders, product data issues, payment status, fulfillment status, and support context.

## Product Architecture

The product should be organized around these domains:

- Catalog: product categories, item data, pricing, images, descriptions, availability.
- User account: auth, profile, balance visibility, purchase history, Steam data.
- Balance ledger: deposits, debits, holds, refunds, failed transactions.
- Cart and checkout: selected items, user requirements, balance validation.
- Provider layer: integrations with external suppliers.
- Fulfillment: order creation, provider status, webhooks or polling, failure handling.
- Legal and compliance: entity data, country, policies, payment constraints.
- Support and trust: FAQ, contacts, order resolution, status explanation.

Category-specific fulfillment should be handled through adapters so new categories can be added without changing the core checkout model.

## Launch Blockers

The project should not enter visual design or implementation planning until these decisions are resolved at product level:

- Legal entity and country.
- Compliance requirements.
- Payment-provider constraints.
- Supported countries and currencies.
- Refund, failed order, and dispute rules.
- Launch product categories.
- Minimum operations and support requirements.
- User-facing fulfillment status model.
- Steam identity requirements for skin purchases.
- Mixed-cart policy across product categories.

## Technical Stack

The final stack is not initialized yet.

Recommended direction for future implementation:

- Web application with server-side backend capabilities.
- Account system with secure auth.
- Persistent database for users, catalog, balance ledger, orders, and provider status.
- Payment-provider integration for bank card and SBP balance deposits.
- Provider API integrations for digital goods fulfillment.
- Asynchronous order status handling through webhooks or polling.
- Structured logging and operational visibility for payment and fulfillment events.

No framework, dependency, or hosting decision is finalized in this document.

## Functional Scope

Core user functions:

- Browse categories and products.
- View product price, image, description, and availability.
- Add products to cart.
- Register or log in.
- Add funds to internal balance by supported payment methods.
- Pay for products using internal balance only.
- Provide required Steam data for skin purchases.
- Receive digital goods through supplier API fulfillment.
- View purchase history and order status.

Minimum operational functions needed for launch planning:

- Manage product data and supplier mappings.
- Reconcile deposits, debits, refunds, and failed orders.
- Monitor provider order status.
- Support users with order-specific context.

Minimum user-facing order states:

- Awaiting payment.
- Paid.
- Processing.
- Requires user action.
- Delivered.
- Failed.
- Refunded.
- Under review.

## User Journeys

Primary purchase journey:

1. User opens Locker.
2. User browses catalog or category pages.
3. User opens a product detail.
4. User adds the product to cart.
5. If unauthenticated, user registers or logs in.
6. User checks balance.
7. User tops up balance if needed.
8. Checkout validates required product data.
9. For skins, user provides or confirms Steam requirements.
10. User pays with internal balance.
11. Locker creates a supplier order.
12. User sees order status.
13. Completed purchase appears in profile history.

Failure journey:

1. Provider rejects or fails fulfillment.
2. Locker shows a clear status and reason where possible.
3. Balance is refunded, held, or escalated according to policy.
4. User can access support with order context.

Steam requirement journey:

1. User chooses a skin product.
2. Locker explains which Steam data is required before purchase.
3. User provides or confirms the required Steam data.
4. Locker shows a clear next step if the data is missing, invalid, or blocked.

Mixed-cart behavior must be decided before visual design. The product must either support one unified checkout across categories or restrict checkout by category/provider with clear user messaging.

## High-Level Information Architecture

- Home.
- Catalog.
- Category pages.
- Product detail.
- Cart.
- Balance top-up.
- Profile.
- Purchase history.
- FAQ.
- Contacts.
- User agreement.
- Privacy policy.
- Cookie policy.

The account area should be simple, but it must support balance, Steam requirements, cart access, and purchase history.

## Known Constraints

- Legal entity information is missing.
- Country of legal registration is missing.
- Compliance requirements are not defined.
- Final supplier API list is incomplete.
- Steam binding method is not decided.
- Product descriptions and image rights require clarification.
- ChatGPT subscription category is uncertain.
- Mixed-cart behavior is not decided.
- Minimum operations surface is not defined.
- Detailed fulfillment state labels and policies are not finalized.
- Supported countries, currencies, taxes, refund rules, and payment-provider limits are not defined.

## Future Scalability Goals

- Add new digital goods categories without rewriting checkout.
- Support multiple suppliers per category.
- Normalize product data across providers.
- Keep pricing and availability updateable.
- Support robust order status and refund workflows.
- Preserve brand consistency as catalog breadth expands.
- Prepare for future SEO, analytics, support, and admin needs.
