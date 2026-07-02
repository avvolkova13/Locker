# AGENTS.md

This file defines how Codex and any supporting agents should work on Locker.

## Source Of Truth Order

1. `BRAND_DNA.md` for brand identity, tone, trust, and timeless design principles.
2. `PROJECT.md` for product scope, architecture, journeys, and constraints.
3. `DESIGN_DIRECTION.md` for practical design guidance derived from `BRAND_DNA.md`.
4. `VISUAL_ANALYSIS.md` for reference interpretation.
5. `PLANS.md` for roadmap sequencing.
6. `TASK.md` for the current working objective.

If documents conflict, stop and resolve the conflict before continuing.

## Planning Mode

The project is currently in Planning Mode.

Do not:

- Initialize a project.
- Create a Next.js app.
- Install dependencies.
- Generate UI.
- Write implementation code.
- Connect APIs.
- Create production configuration.

Planning work may create or edit project documentation only when explicitly requested.

## Development Workflow

When implementation is later approved:

1. Read the required documents before starting.
2. Confirm the current task and scope.
3. Identify the smallest safe unit of work.
4. Make changes in focused increments.
5. Verify behavior and quality before reporting completion.
6. Never override `BRAND_DNA.md` principles for short-term visual novelty.

## Available Agents

Subagents are available through `multi_agent_v1`:

- `default`: general support.
- `explorer`: focused codebase or documentation investigation.
- `worker`: bounded execution work with clear ownership.

Use subagents only when the user explicitly asks for subagents, delegation, or parallel agent work.

## Available Skills

Relevant skills identified in this environment include:

- `brandkit`: brand identity and visual-system reasoning.
- `frontend-design-pro`: premium frontend visual direction.
- `ui-ux-pro-max`: UI/UX guidance, accessibility, layout, and quality checks.
- `high-end-visual-design`: high-end visual and motion quality.
- `design-taste-frontend`: anti-generic frontend design discipline.
- `webapp-testing`: future local web app verification.
- Figma skills: design context, design generation, Code Connect, diagrams, motion, and library work.
- Superpowers workflow skills: brainstorming, planning, TDD, verification, code review, and branch completion.

Use skills only when they improve the task. Always read the applicable skill before using it.

## MCP Servers And Plugins

Available design and product-supporting tools include:

- Figma MCP: read and write Figma designs, inspect design context, capture screenshots, search design systems.
- Magic UI MCP: search component registry items.
- GSAP Master MCP: reason about or generate advanced motion patterns.
- ReactBits MCP: search and inspect visual React components.
- Node REPL MCP: controlled JavaScript execution where appropriate.

Rules:

- Do not call Figma write tools without the required Figma skill guidance.
- Do not use design-system assets without checking whether they fit `BRAND_DNA.md`.
- Do not use motion tools to add spectacle without a state, hierarchy, or feedback purpose.
- Do not install or scaffold anything without explicit approval.

## Design Quality Gates

Before approving any design direction or UI work, check:

- Does it preserve Locker as a serious digital product, not a themed interface?
- Does it make ownership, trust, access, control, or personal space clearer?
- Does it avoid casino, loot-box, crypto-hype, and generic gaming patterns?
- Are product imagery, pricing, balance, and status clear?
- Is motion purposeful and non-manipulative?
- Is the experience accessible and readable?
- Would the design still make sense if Locker adds new digital goods categories?

## QA Workflow

Future QA should include:

- Brand alignment review against `BRAND_DNA.md`.
- UX review for account, balance, checkout, and fulfillment clarity.
- Accessibility review for contrast, keyboard navigation, labels, focus states, and reduced motion.
- Responsive review across mobile, tablet, and desktop.
- Technical verification for purchase, balance, provider, and failure states.
- Content review for legal, payment, refund, and support clarity.

## Preferred Review Workflow

1. Self-review against the source-of-truth documents.
2. Product and UX review for flow completeness.
3. Brand and visual review for quality and restraint.
4. Technical review for architecture, reliability, and scalability.
5. Final verification before marking any work complete.

## Stop Rules

Stop and ask for direction if:

- Legal entity, country, compliance, or payment requirements affect the task.
- Supplier APIs or fulfillment behavior are unknown and required.
- A design choice conflicts with `BRAND_DNA.md`.
- The work requires project initialization or dependency installation.
- The task would turn payment, balance, or purchase behavior into a game-like experience.
- A requested change creates legal, trust, or payment-provider risk.
