/** Parsed as untrusted TSX text. Never imported, transpiled, rendered, or executed. */
const residences = [
  { name: "The Courtyard House", location: "Hyderabad", image: "/v11-fixtures/residence-1.svg" },
  { name: "The Glass Pavilion", location: "Bengaluru", image: "/v11-fixtures/residence-2.svg" },
  { name: "The Garden Rooms", location: "Chennai", image: "/v11-fixtures/residence-3.svg" },
];

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="border-t border-stone-300 pt-4">
    <strong className="font-serif text-3xl font-medium">{value}</strong>
    <span className="mt-2 block text-xs uppercase tracking-widest text-stone-600">{label}</span>
  </div>
);

function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">{children}</p>;
}

const ResidenceCard = ({ name, location, image }: { name: string; location: string; image: string }) => (
  <article className="group relative overflow-hidden rounded-3xl bg-stone-900 shadow-xl hover:-translate-y-2">
    <img src={image} alt={`${name}, ${location}`} data-media-role="gallery-item" className="h-80 w-full object-cover opacity-80" />
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 to-transparent p-6 text-white">
      <h3 className="font-serif text-2xl">{name}</h3>
      <p className="mt-2 text-sm uppercase tracking-widest text-stone-300">{location}</p>
    </div>
  </article>
);

export default function LuxuryRealEstate() {
  return (
    <>
      <section aria-label="Luxury residences hero" className="relative min-h-screen overflow-hidden bg-stone-950 text-white">
        <img src="/v11-fixtures/luxury-residence-hero.svg" alt="Sculptural contemporary residence at dusk" data-media-role="hero-background" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent" />
        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-12 items-center gap-8 px-6 py-24 lg:px-12">
          <div className="col-span-12 flex flex-col items-start gap-8 lg:col-span-7">
            <Eyebrow>Private residences · South India</Eyebrow>
            <h1 className="max-w-4xl font-serif text-5xl font-medium leading-[0.96] tracking-tight md:text-7xl lg:text-8xl">Architecture shaped around the art of arrival.</h1>
            <p className="max-w-2xl text-lg font-light leading-8 text-stone-200 md:text-xl">A limited collection of garden residences where quiet materiality, generous light, and considered landscapes create enduring homes.</p>
            <button className="rounded-full border border-amber-300 bg-amber-300 px-8 py-4 text-sm font-semibold tracking-wide text-stone-950 shadow-xl hover:-translate-y-1 focus-visible:ring-2">Request a private viewing</button>
          </div>
          <div className="absolute bottom-10 right-6 z-20 w-72 overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent lg:right-12 lg:w-96">
            <img src="/v11-fixtures/luxury-residence-detail.svg" alt="Warm stone and timber interior detail" data-media-role="floating-card-image" className="relative z-10 h-48 w-full rounded-2xl object-cover lg:h-56" />
            <div className="relative z-10 flex items-end justify-between gap-4 px-3 pb-2 pt-4 text-white">
              <div><p className="text-xs uppercase tracking-widest text-stone-300">Now presenting</p><h2 className="mt-2 font-serif text-2xl">The Courtyard House</h2></div>
              <p className="text-sm text-amber-300">01 / 04</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-stone-100 px-6 py-24 text-stone-900 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-4"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">A quieter expression of luxury</p></div>
          <div className="flex flex-col gap-10 lg:col-span-7 lg:col-start-6">
            <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight md:text-6xl">Designed as a sequence of light, landscape, and privacy.</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <p className="text-lg leading-8 text-stone-600">Every residence is composed around planted courts and long views, balancing dramatic scale with intimate rooms for everyday rituals.</p>
              <img src="/v11-fixtures/luxury-residence-courtyard.svg" alt="Landscaped internal courtyard" data-media-role="editorial-image" className="h-80 w-full rounded-t-full object-cover shadow-xl md:-mt-16" />
            </div>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <StatCard value="24" label="Private residences" />
              <StatCard value="3.8" label="Acres of landscape" />
              <StatCard value="2027" label="Expected completion" />
            </div>
          </div>
        </div>
        <div className="mx-auto mt-24 grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3 md:-mt-8">
          {residences.map((residence) => (
            <ResidenceCard name={residence.name} location={residence.location} image={residence.image} />
          ))}
        </div>
      </section>
    </>
  );
}
