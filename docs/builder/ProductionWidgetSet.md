# Production Widget Set

Date: 2026-07-09  
Phase: BSP-15  
Status: Native production widget catalog implemented

## Objective

The production widget set defines the native editable Builder primitives that future AI generation may target after release gates pass. BSP-15 converts the previous scaffold backlog into registered Builder widgets with editable props, editable styles, inspector metadata, responsive metadata, theme-token metadata, serialization contracts, canvas/runtime parity rendering, and AI readiness metadata.

## Implemented Tier 1 Widgets

| Widget | Builder Type | Status | Notes |
| --- | --- | --- | --- |
| Accordion / FAQ | `accordion`, `faq` | Implemented | Native item list and editable content/style metadata. |
| Tabs | `tabs` | Implemented | Native tab metadata with static Builder-safe rendering. |
| Testimonials | `testimonials`, `testimonial` | Implemented | Editable proof cards and theme-aware styling. |
| Pricing Table | `pricing` | Implemented | Editable plan cards and CTA metadata. |
| Stats / Counter | `statsCounter` | Implemented | Counter animation remains metadata only. |
| Logo Cloud | `logoCloud` | Implemented | Editable logo/name list with accessibility label metadata. |
| Gallery / Masonry | `gallery`, `galleryLightbox`, `masonryGallery` | Implemented | Native visual grid rendering with responsive metadata. |
| Team | `team` | Implemented | Editable people-card content. |
| Portfolio Grid | `portfolio` | Implemented | Editable portfolio/case-study cards. |
| Timeline / Process | `timeline` | Implemented | Editable sequence/process cards. |
| CTA Banner | `cta` | Implemented | Editable conversion section. |
| Feature Grid | `featureGrid`, `cardGrid`, `features` | Implemented | Editable feature-card grid. |
| Lead Form | `leadForm` | Implemented | Native form display metadata; no submission behavior changes. |
| Contact Form | `contactForm`, `form` | Implemented | Native contact form display metadata; no submission behavior changes. |
| Location Map | `locationMap` | Implemented | Editable address/provider metadata; no external map execution added. |
| Social Links | `socialLinks`, `floatingWhatsApp` | Implemented | Editable social/contact link metadata. |

## Implemented Tier 2 Widgets

| Widget | Builder Type | Status | Notes |
| --- | --- | --- | --- |
| Carousel | `carousel` | Implemented | Static Builder-safe carousel layout; runtime auto-play not added. |
| Before / After | `beforeAfter` | Implemented | Static comparison layout with editable metadata. |
| Table | `table` | Implemented | Native table-like structured metadata. |
| Countdown | `countdown` | Implemented | Static countdown display; live timer execution remains future work. |
| Code Block | `codeBlock` | Implemented | Displays code as text; does not execute scripts. |
| Embed | `embed` | Restricted | Registered with safety warning; stores metadata only and does not execute opaque HTML/JS. |
| Popup | `popupModal` | Metadata only | Registered as gated metadata; no runtime modal, trigger, or focus-trap execution. |
| Blog Grid | `blogGrid` | Implemented | Editable article-card metadata. |
| Post List | `postList` | Implemented | Editable post-list metadata. |
| Category List | `categoryList` | Implemented | Editable category/link metadata. |

## Rules

- Widgets must stay native Builder nodes.
- No widget may rely on opaque HTML/template blobs.
- Embed/code must not execute arbitrary JavaScript.
- Popup remains metadata-only until accessibility and runtime gates pass.
- AI insertion remains disabled until Builder release gates pass.
