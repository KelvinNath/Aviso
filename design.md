# Aviso Design System

## Vision

**Official information. Unofficial personality.**

Aviso should feel like a bold, fun productivity brand for students — not a government portal, not an AI startup, and not a coaching website.

## Brand personality

- Playful but trustworthy
- Bold and energetic
- Student-first
- Friendly, witty microcopy
- Clean information hierarchy

**One-line summary:** A productivity app disguised as a fun student brand.

## Target audience

Students (16–24) who want fast, official updates without constantly checking exam websites.

## What Aviso is not

| Avoid | Examples |
|-------|----------|
| AI startup aesthetic | Dark gradients, glassmorphism, neural network hero art |
| EdTech coaching look | BYJU'S, Vedantu, cartoon school vibes |
| Generic SaaS | Inter everywhere, blue rectangles, flat corporate cards |
| Government portal | Dense tables, zero personality, grey forms |

## Visual direction

- Bright UI with optional dark mode
- Neon accents on warm beige (light) / near-black (dark)
- Thick rounded borders (neo-brutalist)
- Sticker-like cards with hard shadows
- Doodles and playful illustrations
- Smooth motion and microinteractions (Framer Motion)

References: Figma Config, Duolingo energy, Pitch.com bold type, modern Webflow award sites.

---

## Color palette

Implemented in `apps/web/src/app/globals.css`.

| Token | Hex | Usage |
|-------|-----|-------|
| Purple | `#6D28FF` | Accents, CTA sections |
| Blue | `#2563FF` | Links, secondary accents |
| Lime | `#C7FF3D` | Primary buttons, focus rings, success |
| Yellow | `#FFE600` | Highlights, Telegram card |
| Coral | `#FF6B6B` | Errors, warnings, "not connected" |
| Sky | `#73D9FF` | Info cards, badges |
| Light (beige) | `#F5F0E8` | Light mode background and surfaces |
| Dark | `#111111` | Text, borders, dark mode background |

Light mode uses **warm beige** (`#F5F0E8`), not pure white. Dark mode inverts with light borders and `#111111` backgrounds.

---

## Typography

| Role | Font | Weights |
|------|------|---------|
| Headings | Bricolage Grotesque | 700 (bold uppercase for display) |
| Body | Manrope | 400–600 |

Configured in `apps/web/src/lib/fonts.ts`. Avoid using Inter as the primary face.

### Hero example

```
Stop refreshing
NTA every
15 minutes.
```

Not: *"Never miss an update."*

---

## UI style

- Chunky buttons with brutal borders and offset shadows
- Rounded cards (`rounded-sticker`, `rounded-chunky`)
- Sticker feel — optional subtle tilt on marketing cards
- Playful icons, doodles, emoji in copy
- Highlighter strokes behind key words (`.highlighter-lime`, `.highlighter-yellow`)

### Cards

Magazine-style variation — different colors, heights, optional 2° tilt on landing. Dashboard cards use straight alignment for readability.

### Buttons

Chunky, rounded, bold uppercase labels.

```
Save me from deadlines →
```

Hover: bounce, scale, slight lift (`HoverLift`, spring animations). Respect `prefers-reduced-motion`.

---

## Copywriting

Professional, witty, never cringe. Patterns live in `apps/web/src/lib/copy.ts`.

| Instead of | Write |
|------------|-------|
| Application deadline approaching. | That deadline you planned to remember? Yeah… it's tomorrow. |
| Admit Card Released | Good news. No more guessing. Your admit card is live. |
| Exam Date Updated | NTA changed the dates. Again. We've already updated them. |
| Result Declared | Deep breath. Results are out. |

### Dashboard voice

| Context | Copy |
|---------|------|
| Greeting | `Evening, Kelvin ☀️` |
| Safe day | Nothing exploded today. You're safe. |
| No new alerts | 🎉 You're all caught up. No academic chaos today. |
| Footer | Peaceful day. We'll wake you when NTA does. |

**Brand promise:** We remember the deadlines. You remember the syllabus.

---

## Motion

- Scroll reveals on landing sections
- Hero stagger animations
- FAQ accordion
- Floating sticker doodles
- Dashboard section fade-ins
- Telegram chat preview animation

All motion gated by `prefers-reduced-motion` where implemented.

---

## Pages

### Landing (`/`)

1. Hero
2. Supported exams
3. How Aviso works
4. Features
5. Telegram preview
6. Testimonials
7. FAQ
8. CTA

Components: `apps/web/src/components/landing/`

### Sign-in (`/signin`)

Google OAuth — "Almost there." + Continue with Google.

### Dashboard (`/dashboard`)

- Greeting + Telegram connect card
- Your exams (subscriptions)
- **My Notifications** (filterable history)
- Onboarding flow at `/dashboard/onboarding`

### Legal

- `/privacy`, `/terms`

### Design system preview

- `/design-system` — live component showcase

---

## Product philosophy

| Channel | Role |
|---------|------|
| **Website** | Control center — auth, subscriptions, notification history |
| **Telegram** | Delivery channel — instant alerts |

The dashboard **My Notifications** section shows the same records as Telegram delivery, so students still see updates if Telegram is down.

---

## Implementation

| Area | Location |
|------|----------|
| Global tokens & utilities | `apps/web/src/app/globals.css` |
| UI primitives | `apps/web/src/components/ui/` |
| Layout | `apps/web/src/components/layout/` |
| Motion | `apps/web/src/components/motion/` |
| Copy | `apps/web/src/lib/copy.ts` |
| Theme (dark mode) | `apps/web/src/components/theme/` |

Run the design system page locally: `npm run dev --workspace=@aviso/web` → `/design-system`.

---

## Accessibility

- Skip-to-content link
- `:focus-visible` lime outlines on interactive elements
- `#main-content` landmarks on marketing and dashboard
- Semantic headings and button labels

---

## Identity

Aviso is a productivity app disguised as a fun student brand — memorable visual identity matters for an audience that lives on Instagram, Discord, Telegram, and YouTube.
