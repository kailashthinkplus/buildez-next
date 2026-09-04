import type { CompositionQualityFixture } from "../CompositionFixtures";

export const healthcareCompositionFixture: CompositionQualityFixture = Object.freeze({
  id: "composition.healthcare", businessFamily: "healthcare", archetype: "appointment-led", conversionGoal: "request an appointment", expectedMinimumScore: 85,
  sections: Object.freeze([
    { id: "hero", componentVariantId: "HeroAppointmentFocused01", category: "hero", purpose: "Care promise" },
    { id: "credentials", componentVariantId: "CredentialsBand01", category: "credential", purpose: "Clinical credentials" },
    { id: "services", componentVariantId: "ServiceMatrixCards01", category: "service", purpose: "Treatments" },
    { id: "doctor", componentVariantId: "DoctorProfileEditorial01", category: "profile", purpose: "Doctor profile" },
    { id: "process", componentVariantId: "CareProcessTimeline01", category: "process", purpose: "Patient journey" },
    { id: "testimonials", componentVariantId: "TestimonialsEditorial01", category: "testimonial", purpose: "Patient trust" },
    { id: "faq", componentVariantId: "FAQObjectionAccordion01", category: "faq", purpose: "Patient questions" },
    { id: "appointment", componentVariantId: "FinalAppointmentBlock01", category: "appointment", purpose: "Request appointment" },
    { id: "footer", componentVariantId: "FooterTrustClosure01", category: "footer", purpose: "Trust closure" },
  ]),
});
