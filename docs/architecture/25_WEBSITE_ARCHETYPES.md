# Website Archetypes

Website archetypes are reusable strategies. They let BuildEZ build by composition rather than by industry-specific generator.

## Required Archetypes

- Lead generation
- Brochure
- Corporate
- Portfolio
- Ecommerce
- Catalogue
- Booking
- Appointment
- Marketplace
- Directory
- Event
- Community
- NGO
- SaaS
- Documentation
- Knowledge base
- Blog/media
- Landing page
- Restaurant menu
- Hotel/resort
- Property showcase
- Product launch
- Recruitment
- Investor relations

## Archetype Contract

Each archetype must define:

- Primary conversion goal.
- Typical visitor journey.
- Required section patterns.
- Optional section patterns.
- Required trust model.
- Required content needs.
- Common asset needs.
- Compatible business families.
- Forbidden component patterns.
- Mobile behavior expectations.
- QA criteria.

## Cross-Industry Examples

| Archetype | Real estate | Healthcare | Restaurant | Education | Automotive |
| --- | --- | --- | --- | --- | --- |
| Lead generation | Project enquiry page. | Specialist clinic enquiry. | Catering enquiry. | Course admissions enquiry. | Test drive enquiry. |
| Brochure | Developer corporate site. | Clinic services site. | Dining venue overview. | School overview. | Dealership overview. |
| Catalogue | Property inventory. | Treatment/service catalogue. | Menu catalogue. | Course catalogue. | Vehicle inventory. |
| Booking/appointment | Site visit booking. | Doctor appointment. | Table reservation. | Campus tour booking. | Service appointment. |
| Portfolio/showcase | Completed projects. | Case outcomes with caution. | Event/private dining showcase. | Student work. | Custom builds or fleet solutions. |

## Selection Rules

The planner should select archetypes from business ontology signals:

- `RevenueModel: quote-based` plus `ConversionGoal: request quote` usually maps to lead generation.
- `RevenueModel: transaction` plus product inventory maps to ecommerce or catalogue.
- `RevenueModel: booking` maps to booking or appointment depending on compliance and schedule type.
- `BusinessModel: publisher` maps to blog/media, documentation, or knowledge base.
- `BusinessModel: institution` can map to brochure, application, community, recruitment, or investor relations.

## Implementation Guidance

Archetypes should be versioned repository records, not prompt paragraphs. An industry may prefer or forbid archetypes, but the archetype itself remains universal.
