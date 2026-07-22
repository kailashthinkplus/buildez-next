/**
 * Complete single-file V11 input. Parsed as untrusted text; never imported or executed.
 */
const services = [
  {
    number: "01",
    title: "Industrial systems",
    body: "High-availability plants engineered from first load study through commissioning.",
    image: "/v11-premium/architecture.png",
  },
  {
    number: "02",
    title: "Energy infrastructure",
    body: "Grid, storage, and distributed generation designed for measurable resilience.",
    image: "/v11-premium/fintech.png",
  },
  {
    number: "03",
    title: "Advanced mobility",
    body: "Electrified transport facilities and test environments built for rapid iteration.",
    image: "/v11-premium/automotive.png",
  },
];

const process = [
  {
    number: "01",
    title: "Frame the system",
    body: "We map constraints, interfaces, risk, and the decisions that will shape performance.",
  },
  {
    number: "02",
    title: "Engineer the proof",
    body: "Integrated teams model the whole system before capital meets concrete.",
  },
  {
    number: "03",
    title: "Deliver with evidence",
    body: "Construction, commissioning, and live telemetry close the loop.",
  },
];

const projects = [
  {
    title: "North Sea Energy Hub",
    meta: "Energy · Esbjerg",
    image: "/v11-premium/real-estate.png",
  },
  {
    title: "Apex Mobility Works",
    meta: "Advanced manufacturing · Pune",
    image: "/v11-premium/automotive.png",
  },
  {
    title: "Meridian Control Centre",
    meta: "Infrastructure · Singapore",
    image: "/v11-premium/ai-saas.png",
  },
];

function ArrowMark() {
  return (
    <svg viewBox="0 0 24 24" aria-label="Arrow" className="h-5 w-5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ServiceCard({
  number,
  title,
  body,
  image,
}: {
  number: string;
  title: string;
  body: string;
  image: string;
}) {
  return (
    <article className="service-card group relative overflow-hidden rounded-3xl bg-[#001833] text-white shadow-2xl">
      <img
        src={image}
        alt={`${title} engineering project`}
        data-media-role="service-image"
        className="h-80 w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#001833] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-8">
        <p className="text-sm font-semibold text-[#58a6ff]">{number}</p>
        <h3 className="mt-4 text-3xl font-semibold">{title}</h3>
        <p className="mt-4 leading-8 text-slate-300">{body}</p>
      </div>
    </article>
  );
}

export default function Website() {
  return (
    <main className="bg-white text-slate-950">
      <header
        id="navbar"
        aria-label="Primary navigation"
        className="absolute inset-x-0 top-0 z-20 border border-white/20 bg-[#001326]/80 px-6 py-5 text-white backdrop-blur-xl"
      >
        <nav className="mx-auto flex max-w-[1500px] items-center justify-between gap-8">
          <a href="#hero" className="text-2xl font-bold tracking-[-0.04em] text-[#0074ff]">
            NORTHLINE / ENGINEERING
          </a>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </div>
          <a
            href="#contact"
            className="rounded-full border border-white px-6 py-3 font-semibold transition hover:-translate-y-1"
          >
            Start a project
          </a>
        </nav>
      </header>

      <section
        id="hero"
        aria-label="Hero"
        className="relative min-h-[100svh] overflow-hidden bg-[#001833] text-white"
      >
        <img
          src="/v11-premium/automotive.png"
          alt="Advanced engineering facility in motion"
          data-media-role="hero-background"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001326] via-[#001326]/70 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1500px] flex-col items-start justify-center gap-8 px-6 py-32 lg:px-12">
          <p className="reveal text-sm font-semibold uppercase tracking-[0.28em] text-[#58a6ff]">
            Integrated engineering · built for consequence
          </p>
          <h1 className="reveal max-w-[1100px] text-[72px] font-bold leading-[0.95] tracking-[-0.04em] md:text-[96px]">
            We engineer the systems industry depends on.
          </h1>
          <p className="reveal max-w-2xl text-xl leading-8 text-slate-300">
            Northline unites strategy, engineering, delivery, and operational
            intelligence for infrastructure that cannot afford uncertainty.
          </p>
          <div className="reveal flex flex-wrap gap-4">
            <a
              href="#services"
              className="inline-flex items-center gap-3 rounded-full bg-[#0074ff] px-8 py-4 font-semibold text-white shadow-2xl hover:-translate-y-1"
            >
              Explore capabilities →
            </a>
            <a
              href="#projects"
              className="rounded-full border border-white px-8 py-4 font-semibold"
            >
              View selected work
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 right-6 z-10 rounded-2xl border border-white/20 bg-[#001326]/80 p-6 text-white backdrop-blur-xl lg:right-12">
          <p className="text-xs uppercase tracking-widest text-slate-300">
            Live portfolio
          </p>
          <p className="mt-3 text-3xl font-bold">18 active programs</p>
        </div>
      </section>

      <section
        id="about"
        aria-label="About"
        className="bg-white px-6 py-24 lg:px-12 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <img
              src="/v11-premium/architecture.png"
              alt="Engineered concrete research campus"
              data-media-role="about-image"
              className="h-[640px] w-full rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute bottom-8 right-[-24px] rounded-2xl bg-[#0074ff] p-8 text-white shadow-2xl">
              <p className="text-5xl font-bold">32</p>
              <p className="mt-2 uppercase tracking-widest">
                disciplines, one team
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-8 lg:col-span-6 lg:col-start-7">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0074ff]">
              One accountable engineering partner
            </p>
            <h2 className="text-5xl font-bold leading-tight tracking-[-0.04em] md:text-7xl">
              Complexity becomes manageable when the whole system is visible.
            </h2>
            <p className="text-xl leading-8 text-slate-600">
              Our engineers work across civil, mechanical, electrical, controls,
              data, and delivery. Decisions stay connected from the first model
              to the first day of operation.
            </p>
            <div className="flex items-center gap-3"><a href="#process" className="border border-slate-950 px-7 py-4 font-semibold">How we work →</a><ArrowMark /></div>
          </div>
        </div>
      </section>

      <section
        id="advantages"
        aria-label="Advantages"
        className="bg-[#001833] px-6 py-24 text-white lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <h2 className="text-5xl font-bold tracking-[-0.04em] md:text-7xl">
              Designed to remove risk before it reaches the field.
            </h2>
            <p className="max-w-2xl text-xl leading-8 text-slate-300">
              Integrated models, evidence-led decisions, and direct senior
              accountability create a faster path from ambition to reliable
              operation.
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            <article className="border border-white/20 p-8">
              <p className="text-5xl font-bold text-[#58a6ff]">01</p>
              <h3 className="mt-8 text-2xl font-semibold">
                Whole-system thinking
              </h3>
              <p className="mt-4 leading-8 text-slate-300">
                Interfaces are designed, tested, and owned—not discovered during
                delivery.
              </p>
            </article>
            <article className="border border-white/20 p-8 md:-mt-10">
              <p className="text-5xl font-bold text-[#58a6ff]">02</p>
              <h3 className="mt-8 text-2xl font-semibold">
                Evidence at every gate
              </h3>
              <p className="mt-4 leading-8 text-slate-300">
                Models, simulations, and field data make trade-offs explicit.
              </p>
            </article>
            <article className="border border-white/20 p-8">
              <p className="text-5xl font-bold text-[#58a6ff]">03</p>
              <h3 className="mt-8 text-2xl font-semibold">
                Delivery intelligence
              </h3>
              <p className="mt-4 leading-8 text-slate-300">
                The design record remains useful long after handover.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="services"
        aria-label="Services"
        className="bg-slate-100 px-6 py-24 lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="uppercase tracking-[0.24em] text-[#0074ff]">
                Capabilities
              </p>
              <h2 className="mt-6 max-w-4xl text-5xl font-bold tracking-[-0.04em] md:text-7xl">
                Engineering depth for assets that shape economies.
              </h2>
            </div>
            <a
              href="#contact"
              className="rounded-full bg-[#001833] px-8 py-4 font-semibold text-white"
            >
              Discuss your program
            </a>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                number={service.number}
                title={service.title}
                body={service.body}
                image={service.image}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="process"
        aria-label="Process"
        className="bg-white px-6 py-24 lg:px-12 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="uppercase tracking-[0.24em] text-[#0074ff]">
              The Northline method
            </p>
            <h2 className="mt-6 text-5xl font-bold tracking-[-0.04em]">
              Three stages. One unbroken line of evidence.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {process.map((step) => (
              <article className="grid grid-cols-1 gap-6 border border-slate-300 py-10 md:grid-cols-4">
                <p className="text-[#0074ff]">{step.number}</p>
                <h3 className="text-3xl font-semibold">{step.title}</h3>
                <p className="leading-8 text-slate-600 md:col-span-2">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="projects"
        aria-label="Projects"
        className="bg-[#001326] px-6 py-24 text-white lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1500px]">
          <p className="uppercase tracking-[0.24em] text-[#58a6ff]">
            Selected work
          </p>
          <h2 className="mt-6 max-w-5xl text-5xl font-bold tracking-[-0.04em] md:text-7xl">
            Infrastructure measured by what it enables.
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-12">
            {projects.map((project) => (
              <article className="project-card group relative overflow-hidden rounded-3xl md:col-span-4">
                <img
                  src={project.image}
                  alt={project.title}
                  data-media-role="project-image"
                  className="h-[520px] w-full object-cover transition"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-8">
                  <h3 className="text-3xl font-semibold">{project.title}</h3>
                  <p className="mt-3 text-slate-300">{project.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        aria-label="Contact"
        className="relative overflow-hidden bg-[#0074ff] px-6 py-24 text-white lg:px-12 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="uppercase tracking-[0.24em]">
              Start with the consequential question
            </p>
            <h2 className="mt-6 text-[64px] font-bold leading-[0.95] tracking-[-0.04em] md:text-[88px]">
              What must this system make possible?
            </h2>
          </div>
          <div className="flex flex-col items-start gap-6 lg:col-span-3 lg:col-start-10">
            <p className="text-xl leading-8">
              Bring us the constraint, the ambition, or the program already in
              motion.
            </p>
            <a
              href="mailto:projects@northline.example"
              className="rounded-full bg-white px-8 py-4 font-semibold text-[#001833]"
            >
              projects@northline.example
            </a>
          </div>
        </div>
      </section>

      <footer
        id="footer"
        aria-label="Footer"
        className="bg-[#000b18] px-6 py-16 text-white lg:px-12"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-[#0074ff]">
                NORTHLINE / ENGINEERING
              </p>
              <p className="mt-6 leading-8 text-slate-300">
                Integrated engineering for infrastructure, industry, energy, and
                mobility.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Capabilities</h3>
              <a href="#services" className="mt-4 block text-slate-300">
                Industrial systems
              </a>
              <a href="#services" className="mt-3 block text-slate-300">
                Energy infrastructure
              </a>
              <a href="#services" className="mt-3 block text-slate-300">
                Advanced mobility
              </a>
            </div>
            <div>
              <h3 className="font-semibold">Studios</h3>
              <p className="mt-4 text-slate-300">
                London · Bengaluru · Singapore · Copenhagen
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Connect</h3>
              <a
                href="mailto:projects@northline.example"
                className="mt-4 block text-slate-300"
              >
                Email
              </a>
              <a
                href="https://example.com"
                className="mt-3 block text-slate-300"
              >
                LinkedIn
              </a>
            </div>
          </div>
          <div className="mt-16 flex flex-wrap justify-between gap-4 border border-white/20 pt-8 text-sm text-slate-300">
            <p>© 2026 Northline Engineering</p>
            <p>Safety · Evidence · Stewardship</p>
          </div>
        </div>
      </footer>

      <style>{`
      .reveal { transition: transform 700ms ease, opacity 700ms ease; }
      .reveal:hover { transform: translateY(-4px); }
      .service-card img, .project-card img { transition: transform 700ms ease, filter 700ms ease; }
      .service-card:hover img, .project-card:hover img { transform: scale(1.04); filter: saturate(1.08); }
      @keyframes northline-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      @media (prefers-reduced-motion: no-preference) { .reveal { animation: northline-rise 700ms ease both; } }
    `}</style>
    </main>
  );
}
