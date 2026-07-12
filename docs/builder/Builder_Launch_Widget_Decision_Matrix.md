# Builder Launch Widget Decision Matrix

Audit date: 2026-07-11. Scores are detailed in `Builder_Complete_Widget_Inventory.md`.

| Decision | Widgets | Score range | Effort | Dependencies / risks | Readiness summary |
| --- | --- | ---: | --- | --- | --- |
| Core Launch | page, section, container, column, heading, text, button, image, video, icon, divider, spacer | 68–84 | Medium | semantic states, a11y, resolver parity, focused tests | Theme partial; design acceptable/professional; AI baseline only |
| Premium Launch after P0/P1 | hero, cardGrid, faq, testimonials, pricing, smartFooter, cta, logoCloud, timeline, featureGrid, codeBlock | 63–70 | Large | structured items/actions, semantic theme internals, interaction/a11y tests | Good visual basis; generic schemas and hardcoded internals |
| Premium Launch after interaction work | smartHeader, leadForm, contactForm, table, socialLinks, statsCounter | 57–66 | Large | navigation/form/data contracts and runtime states | Advertised utility is incomplete |
| Industry Launch | offerGrid, team, portfolio, floatingWhatsApp | 53–65 | Large | structured vertical data, safe URLs/actions | Useful only with vertical templates/contracts |
| Marketplace Launch | locationMap | 55 | Large | verified provider manifest, consent/CSP, entitlement | Safe placeholder only today |
| Post-launch | galleryLightbox, tabs, masonryGallery, carousel, beforeAfter, countdown, blogGrid, postList, categoryList | 45–62 | Large | interactions or CMS/data binding | Renderer preview does not fulfill product name |
| Gated | embed | 50 | Large | provider allowlist/sandbox/CSP | Retain safe metadata only |
| Reject from launch | popupModal | 35 | Large | dialog runtime, triggers, focus/dismissal | Metadata only |
| Consolidate | features + cardGrid + featureGrid; faq + accordion; gallery family | 51–68 | Medium | migration aliases and variant schemas | Avoid parallel renderers and duplicate marketplace records |
| Replace advertised implementation | tabs, carousel, beforeAfter, countdown, forms | 45–58 | Large | accessible functional components | Static illustrations must not ship under interactive names |

No widget currently reaches the strict 90-point Launch Ready threshold. This is a quality gate, not a claim that the core editor is unusable. Core widgets are the closest launch candidates once shared theme/a11y/test gaps are closed.
