# Builder Industry Widget and Theme Coverage

Audit date: 2026-07-11

The current primitives can compose brochure and lead-generation sites, but industry widgets are mostly generic premium shells with industry-flavored copy. “Existing” below means a registered type, not a complete vertical integration.

| Industry | Required / existing | Missing and premium candidates | Theme/section/card/form needs | Launch blocker |
| --- | --- | --- | --- | --- |
| Real Estate | Hero, gallery, offerGrid, map, leadForm, WhatsApp exist | Structured property card/filter, amenities, floor plans, agent, enquiry routing | image-led neutral/luxury; listing cards; visit form | offer/map/form are placeholders, no listing schema |
| Healthcare | Team, FAQ, contact/lead forms, map exist | clinician/service cards, appointment and insurance patterns | calm high-contrast palette; credential cards; accessible appointment form | claim safety, form runtime, structured clinicians |
| Restaurant | Gallery, offerGrid, map, contact, WhatsApp exist | menu, reservation, hours, dietary metadata | warm image-led; menu cards; reservation form | no menu/reservation contract |
| Automotive | Gallery, offerGrid, beforeAfter, forms exist | vehicle inventory/specs, finance enquiry, service booking | strong neutral; inventory/spec cards | beforeAfter/inventory/form incomplete |
| Education | Pricing, team, FAQ, timeline, forms, video exist | course/curriculum cards, schedule, enrollment | trustworthy accessible; course cards; enrollment form | no structured courses/submission |
| D2C/Ecommerce | offerGrid, pricing, gallery, testimonials exist | cart/product detail/variants/search/filter/reviews | product-forward; price/product cards | no commerce data/action runtime |
| Hospitality | Gallery, offerGrid, map, testimonials, forms exist | room/rate/availability/booking/amenities | premium imagery; room cards; booking form | no booking/provider contract |
| Interior Design | Gallery, portfolio, beforeAfter, team, form exist | case-study detail/material palette | editorial neutral; project cards | media schemas and beforeAfter incomplete |
| Agency | Hero, feature/card grid, portfolio, team, testimonials, CTA exist | case-study detail/results model | bold or minimal; outcome cards; brief form | structured cards and forms incomplete |
| Portfolio | Gallery, portfolio, categoryList, contact exist | project detail/lightbox/filter | minimal image-led | CMS/filter/lightbox incomplete |
| SaaS | Hero, features, pricing, FAQ, testimonials, lead form exist | integrations, comparison, changelog/data binding | crisp product; feature/pricing cards; signup form | actions/forms and tabs incomplete |
| Local Business | Hero, map, gallery, testimonials, contact, WhatsApp exist | opening-hours/service-area/booking | warm approachable; service cards | provider/action/form contracts incomplete |

Industry-specific data belongs in declared structured item schemas and platform integrations. Industry page sections remain template compositions of native widgets. Do not create opaque “Real Estate Section” or “Healthcare Hero” node types.
