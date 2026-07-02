# DESIGN_DIRECTION.md

This document translates `BRAND_DNA.md` into practical interface-system guidance. It does not replace `BRAND_DNA.md` and should not repeat brand philosophy unless needed for design decisions.

## Design Position

Locker should feel like a premium digital goods product with account depth, not a themed marketplace. The interface should make ownership, trust, access, control, and personal space visible through hierarchy, states, spacing, and clarity.

## Typography System

- Brand/display typography should be modern, precise, and quietly confident.
- Body typography should prioritize long-form readability for product, legal, support, and payment content.
- Numeric and status typography should feel exact and accountable for prices, balances, order IDs, and metadata.
- Avoid gamer display fonts, fake luxury serifs, overly futuristic type, tiny low-contrast labels, and generic starter-kit typography.

## Color System

- Use calm base surfaces: graphite, off-black, smoke, and deep neutrals rather than pure black.
- Use one primary action accent that communicates access and forward movement.
- Use secondary accents sparingly for hierarchy, not decoration.
- Reserve status colors for real meaning: pending, paid, processing, delivered, failed, refunded, review, Steam required, and insufficient balance.
- Product metadata colors may reflect rarity or category, but must not fragment the brand palette.
- Avoid casino red/gold, crypto purple glow, random neon, and gradients as the primary identity.

## Spacing System

- Use generous spacing for brand, trust, payment, and decision moments.
- Use efficient spacing for catalog comparison without reducing image, price, or metadata clarity.
- Product cards need enough internal space for image, name, price, and critical metadata.
- Mobile spacing should be tighter but never cramped around CTAs, price, balance, forms, or status.

## Grid System

- Desktop layouts should use a disciplined grid with controlled asymmetry only where it improves emphasis.
- Catalog grids should be repeatable, scannable, image-first, and price-visible.
- Product-detail grids should create one clear focal product area with purchase information nearby.
- Checkout and account grids should be stable, linear, and low-noise.
- Mobile layouts should collapse into one clear task flow at a time.

## Surface System

- Define clear surface roles: base, elevated, focused action, status, product, account, and support/legal.
- Panels should separate through tone, hairline borders, or subtle shadow, not heavy decoration.
- Product containers should frame digital goods as valuable content.
- Balance/account surfaces should feel more ledger-like and dependable than promotional.
- Avoid excessive glass, heavy blur, thick outlines, harsh shadows, and overlit neon edges.

## Button System

- Primary CTAs should be singular, high-confidence, and clearly tied to the main action.
- Secondary CTAs should be quieter and support details, edits, returns, or auxiliary actions.
- Destructive/error actions should be restrained but unmistakable.
- Disabled and loading states must be explicit, especially around payment, balance, and checkout.
- Hover and active states should feel tactile and responsive without jumpy scaling, flashy glow, or reward-like behavior.

## Form System

- Auth forms should be simple and low-friction.
- Balance top-up forms must be especially clear about amount, method, processing expectation, and result.
- Steam requirement forms need visible helper text explaining what is required and why.
- Errors should be specific, close to the relevant field or action, and written in plain language.
- Avoid placeholder-only labels, hidden requirements, ambiguous validation, and promotional payment forms.

## Product Card System

- Skin cards should be image-led with clear name, game/category, price, condition or quality, and availability when known.
- Steam Wallet cards should be denomination-led with region, method, delivery expectation, price, and balance requirement.
- Subscription cards should be trust-led with access type, duration or plan, delivery method, constraints, and support clarity.
- Metadata hierarchy should be: product identity, name/category, price, critical requirements, then secondary metadata.
- Price must remain stable, visible, and easy to scan.
- Image framing should unify different product categories without making every category look identical.

## Status System

- Status must use text, color, placement, and iconography together; color alone is not enough.
- Pending should explain what is waiting.
- Paid should confirm funds, not imply delivery.
- Processing should show order movement without fake precision.
- Delivered should clearly close the purchase loop.
- Failed should explain the reason where possible and show the next action.
- Refunded should make the money outcome clear.
- Manual review should feel calm and serious.
- Steam required and insufficient balance should be treated as action states, not generic errors.

## Motion System

- Motion must communicate state, hierarchy, feedback, or transition.
- Use subtle motion for hover, add-to-cart feedback, balance updates, checkout progress, and order status changes.
- Motion should clarify access, progress, confirmation, arrival, and resolution.
- Never animate payment as spectacle, price changes as excitement, random product reveals, failure states playfully, or legal/support content in a way that hides access.
- Reduced-motion behavior must be respected.

## Navigation System

- Navigation should be quiet, persistent, and utility-focused.
- Account, balance, and cart access should be visible without dominating the interface.
- Category navigation should support fast browsing across Steam Wallet, skins, subscriptions if approved, and future categories.
- Mobile navigation should prioritize catalog, category/search access, cart, balance/account, and support in checkout or order states.

## Trust System

- Trust should appear through clear behavior, not generic badges.
- Show balance logic, price, requirements, order states, support paths, legal access, and refund/error states clearly.
- Payment clarity should explain what the user pays with, what happens after top-up, what happens after purchase, and what happens if delivery fails.
- Generic trust badges should be used only if legally, commercially, or payment-provider required.

## Responsive System

- Desktop may use more visual breadth, richer product comparison, and controlled asymmetry.
- Tablet should preserve product image quality and avoid awkward checkout compromises.
- Mobile should focus on one task at a time with price, CTA, status, balance, and requirements close together.
- Catalog mobile behavior should preserve scan rhythm and critical metadata.
- Checkout mobile behavior should be linear and surface requirements before final payment action.

## Accessibility Gates

- Target WCAG AA contrast for all essential text and controls.
- Preserve visible focus states and keyboard access across catalog, cart, auth, balance, checkout, profile, and support.
- Keep mobile touch targets comfortable.
- Do not rely on color alone for status.
- Reduced-motion mode must preserve clarity.
- Product imagery must remain recognizable across breakpoints.

## Anti-Template Rules

- Do not use a standard centered hero plus three cards as the default structure.
- Do not rely on generic SaaS gradients, decorative blobs, repeated identical content blocks, or filler icon rows.
- Do not make the interface feel cheap through low contrast, inconsistent spacing, cropped product images, fake badges, or random motion.
- Do not use crypto or casino signals: coins, chains, token graphics, roulette cues, jackpot cues, mystery-box reveals, or red/gold reward styling.
- Do not let the catalog become a cluttered reseller table or discount-first marketplace.
- Do not build the visual system from disconnected components; system decisions should come before screens.

## Design Quality Checklist

Before approving a design decision, check:

- Does it align with `BRAND_DNA.md`?
- Does it make ownership, trust, access, control, or personal space clearer?
- Are price, balance, status, requirements, and next action visible?
- Are loading, empty, error, failed, refunded, and review states considered?
- Are focus states, labels, contrast, touch targets, and reduced-motion behavior accounted for?
- Does it avoid literal brand theming, casino signals, crypto signals, and generic gaming signals?
- Can the pattern scale to future digital goods categories?
- Is the result calm, clear, and accountable?
