# Builder Complete Widget Inventory

Audit date: 2026-07-11  
Authoritative runtime registry: `apps/web-app/modules/builder-v2/widgets/registerWidgets.ts`  
Capability source: `apps/web-app/modules/builder-v2/widgets/widgetCapabilities.ts`

## Scope and scoring

The launch inventory contains 48 registered node types: 12 core and 36 premium definitions. “Registered” does not mean the advertised interaction exists. All premium definitions currently share `PremiumWidget.tsx`, `ProductionWidgetView.tsx`, and one property schema. Scores use ten equally weighted dimensions: rendering, Inspector, responsive behavior, serialization, validation, theme integration, default design, accessibility, AI readiness, and tests.

Legend: I Inspector, R renderer, P preview, U published runtime, S serialization, Resp responsive, T theme, A11y accessibility, C clipboard/duplicate/undo, V validation, AI AI metadata, Q tests. `Y` is evidenced, `P` partial, `N` absent/gated. All source paths below are relative to `apps/web-app/modules/builder-v2`.

## Registered widget inventory

| ID | Name | Category | Tier / form | Source | I/R/P/U/S | Resp/T/A11y | C/V/AI/Q | Default quality | Score | Launch status | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| page | Page | Layout | Core/native | `widgets/page/*` | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/Y | Acceptable | 78 | Minor work | Core Launch; finish inherited theme/reset semantics |
| section | Section | Layout | Core/native | `widgets/section/*` | Y/Y/Y/Y/Y | Y/P/P | Y/Y/P/Y | Acceptable | 80 | Minor work | Core Launch; tokenized responsive spacing now default |
| container | Container | Layout | Core/native | `widgets/container/*` | Y/Y/Y/Y/Y | Y/P/P | Y/Y/P/Y | Acceptable | 79 | Minor work | Core Launch; consolidate row/grid semantics |
| column | Column | Layout | Core/native | `widgets/column/*` | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/Y | Functional but visually weak | 74 | Major work | Core Launch after responsive width tests |
| heading | Heading | Content | Core/native | `widgets/heading/*` | Y/Y/Y/Y/Y | Y/P/P | Y/Y/P/Y | Professional default | 84 | Minor work | Core Launch; enforce heading hierarchy |
| text | Text / rich text | Content | Core/native | `widgets/text/*` | Y/Y/Y/Y/Y | Y/P/P | Y/Y/P/Y | Professional default | 83 | Minor work | Core Launch; sanitize rich content contract |
| button | Button | Actions | Core/native | `widgets/button/*` | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/Y | Acceptable | 80 | Minor work | Core Launch; hover/focus/disabled tokens required |
| image | Image | Media | Core/native | `widgets/image/*` | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/Y | Acceptable empty state | 77 | Minor work | Core Launch; media picker and alt enforcement |
| video | Video | Media | Core/native | `widgets/video/*` | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/Y | Acceptable empty state | 72 | Major work | Core Launch after controls/caption tests |
| icon | Icon | Media | Core/native | `widgets/icon/*` | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/Y | Acceptable | 73 | Major work | Replace glyph placeholder with icon picker |
| divider | Divider | Layout | Core/native | `widgets/divider/*` | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/Y | Acceptable | 76 | Minor work | Core Launch; semantic border token |
| spacer | Spacer | Layout | Core/native | `widgets/spacer/*` | Y/Y/Y/Y/Y | Y/N/P | Y/Y/N/Y | Functional but visually weak | 68 | Major work | Core Launch utility; discourage AI insertion |
| smartHeader | Smart Header | Navigation | Premium/composite | `widgets/premium/*` | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Visually inconsistent | 66 | Major work | Premium Launch only after real mobile navigation |
| hero | Conversion Hero | Marketing | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 70 | Major work | Premium Launch after media/layout variants |
| leadForm | Lead Capture Form | Forms | Premium/composite | same | Y/Y/Y/Y/Y | P/P/N | Y/Y/P/P | Functional but visually weak | 58 | Major work | Block launch until semantic fields/submission states |
| cardGrid | Feature Card Grid | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 68 | Major work | Premium Launch after item model replaces strings |
| galleryLightbox | Gallery Lightbox | Media | Premium/composite | same | Y/P/P/P/Y | P/P/N | Y/Y/P/P | Broken advertised interaction | 51 | Major work | Post-launch until lightbox/keyboard behavior exists |
| faq | FAQ Accordion | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 69 | Major work | Premium Launch after Q/A item schema and a11y tests |
| testimonials | Testimonials | Social proof | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 67 | Major work | Premium Launch; structured quote/person/rating fields |
| pricing | Pricing Table | Commerce | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 65 | Major work | Premium Launch; remove fabricated currency/prices |
| offerGrid | Product / Offer Grid | Commerce | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 65 | Major work | Industry Launch after structured offer cards |
| floatingWhatsApp | Floating WhatsApp | Conversion | Premium/composite | same | Y/P/P/P/Y | P/N/P | Y/Y/P/P | Visually inconsistent | 53 | Major work | Industry Launch after URL, consent, placement controls |
| locationMap | Location Map | Integrations | Premium/composite | same | Y/P/P/P/Y | P/P/P | Y/Y/P/P | Functional but visually weak | 55 | Major work | Marketplace Launch after safe provider contract |
| smartFooter | Smart Footer | Navigation | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 66 | Major work | Premium Launch after structured links/legal fields |
| features | Feature Story | Marketing | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 67 | Major work | Consolidate with featureGrid/cardGrid variants |
| gallery | Editorial Gallery | Media | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 66 | Major work | Consolidate gallery family |
| cta | Conversion CTA | Conversion | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 69 | Major work | Premium Launch after link/action fields |
| accordion | Accordion / FAQ | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 68 | Major work | Alias FAQ variant or separate generic item contract |
| tabs | Tabs | Advanced UI | Premium/composite | same | Y/P/P/P/Y | P/P/N | Y/Y/P/P | Broken advertised interaction | 49 | Not launch ready | Post-launch until tab state/keyboard semantics exist |
| statsCounter | Stats / Counter | Marketing | Premium/composite | same | Y/P/P/P/Y | P/P/P | Y/Y/P/P | Functional but visually weak | 57 | Major work | Static stats launch; counter animation post-launch |
| logoCloud | Logo Cloud | Social proof | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 65 | Major work | Premium Launch after logo asset/alt model |
| masonryGallery | Gallery / Masonry | Media | Premium/composite | same | Y/P/P/P/Y | P/P/P | Y/Y/P/P | Broken advertised layout | 51 | Major work | Consolidate with gallery; masonry post-launch |
| team | Team | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 64 | Major work | Industry Launch after person/image/link fields |
| portfolio | Portfolio Grid | Portfolio | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 65 | Major work | Industry Launch after project/card schema |
| timeline | Timeline / Process | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 66 | Major work | Premium Launch after structured steps |
| featureGrid | Feature Grid | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 67 | Major work | Consolidate with cardGrid/features |
| contactForm | Contact Form | Forms | Premium/composite | same | Y/Y/Y/Y/Y | P/P/N | Y/Y/P/P | Functional but visually weak | 57 | Major work | Core candidate eventually; launch blocked by form runtime |
| socialLinks | Social Links | Social | Premium/composite | same | Y/Y/Y/Y/Y | P/N/P | Y/Y/P/P | Functional but visually weak | 58 | Major work | Core candidate; structured safe external links |
| carousel | Carousel | Media | Premium/composite | same | Y/P/P/P/Y | P/P/N | Y/Y/P/P | Broken advertised interaction | 47 | Not launch ready | Post-launch until controls, focus, reduced motion |
| beforeAfter | Before / After | Media | Premium/composite | same | Y/P/P/P/Y | P/P/N | Y/Y/P/P | Broken advertised interaction | 46 | Not launch ready | Marketplace post-launch |
| table | Table | Data | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Functional but visually weak | 59 | Major work | Premium Launch after real headers/cells/caption |
| countdown | Countdown | Conversion | Premium/composite | same | Y/P/P/P/Y | P/P/P | Y/Y/P/P | Broken advertised timing | 45 | Not launch ready | Post-launch until timezone/runtime logic |
| codeBlock | Code Block | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 63 | Major work | Premium Launch after language/copy accessibility |
| embed | Embed (Restricted) | Integrations | Premium/restricted | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/N/P | Safe placeholder | 50 | Gated | Retain gated manifest/provider metadata only |
| blogGrid | Blog Grid | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 62 | Major work | Post-launch pending CMS/data binding |
| postList | Post List | Content | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 61 | Major work | Post-launch pending CMS/data binding |
| categoryList | Category List | Navigation | Premium/composite | same | Y/Y/Y/Y/Y | P/P/P | Y/Y/P/P | Acceptable | 61 | Major work | Post-launch pending collection binding |
| popupModal | Popup (Metadata Only) | Conversion | Premium/metadata | same | Y/N/N/N/Y | P/P/N | Y/Y/N/P | No runtime default | 35 | Not launch ready | Reject from launch; retain metadata only |

## Non-registered and overlapping discoveries

| Item | Evidence | Status | Decision |
| --- | --- | --- | --- |
| `grid`, `form`, `footer`, `custom`, `testimonial`, `featureGrid` aliases | `types/blueprint.ts` | Partial type vocabulary; only `featureGrid` is registered | Validate registered types; migrate aliases deliberately |
| `PageWidget`, `SectionWidget`, `ContainerWidget`, `HeadingWidget` | `widgets/core/*`, `widgets/layout/*` | Duplicate/obsolete render components outside registry definitions | Deprecate after import audit; do not expose |
| Section patterns | `library/sections/marketingSections.ts` | Composite templates, not widgets | Template-only; retain native children |
| Website Engine components/recipes | `website-engine/components/*`, `creative-library/*` | Design recipes and selection metadata | Template/AI assets; never register as opaque widgets |
| Legacy Builder V2/V3 registries and renderers | `modules/_legacy/*` | Obsolete duplicate systems | Exclude from launch, preserve only for migration evidence |

## Required core-set gaps

Row, Grid, Stack, Inner Container, Rich Text as a distinct contract, Paragraph, Link, List, Icon Text, Blockquote, Logo, Button Group, and native form controls are not registered. Several can be variants or compositions rather than new node types: Row/Stack should be container presets; Inner Container should be a container variant; Paragraph/Rich Text can be Text variants; Logo can be Image semantics; Icon Text and Button Group can be templates. Grid, Link/List/Blockquote, and composable accessible form controls require explicit product decisions before implementation.

## Totals

- Registered widgets: 48; core: 12; premium-labelled: 36.
- Marketplace metadata: 24 entries total, comprising 12 core and only 12 of 36 premium widgets.
- Launch-ready at the strict 90-point threshold: 0. Minor-work candidates: 7. Major-work/partial: 35. Not-launch-ready/gated: 6.
- Duplicates/overlaps: three premium families (`features/cardGrid/featureGrid`, `faq/accordion`, `gallery/galleryLightbox/masonryGallery`) plus four obsolete wrapper components and legacy registries.
- Theme support is partial for all 48 until semantic states and inheritance/reset semantics are complete; 36 premium widgets previously embedded hardcoded internal colors.
