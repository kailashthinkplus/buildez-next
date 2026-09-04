const advantages = [
  [
    "01",
    "Interface certainty",
    "Every boundary is modeled, owned, and verified before work reaches site.",
  ],
  [
    "02",
    "Evidence first",
    "Decisions remain connected to simulations, field data, and operating outcomes.",
  ],
  [
    "03",
    "Integrated delivery",
    "Civil, energy, controls, and commissioning teams work as one system.",
  ],
  [
    "04",
    "Operational memory",
    "The engineering record remains useful throughout the asset lifecycle.",
  ],
];

const services = [
  [
    "Civil systems",
    "Structures shaped around constructability, durability, and exact load paths.",
    "/v11-aznac-parity/service-civil.png",
  ],
  [
    "Energy networks",
    "Generation, storage, and resilient distribution engineered as one connected network.",
    "/v11-aznac-parity/service-energy.png",
  ],
  [
    "Advanced mobility",
    "High-throughput transport and manufacturing environments built for continuous change.",
    "/v11-aznac-parity/service-mobility.png",
  ],
  [
    "Digital controls",
    "Control rooms, telemetry, and operational intelligence designed into the physical asset.",
    "/v11-aznac-parity/service-controls.png",
  ],
];

const steps = [
  [
    "01",
    "Discover the whole",
    "Map the constraints, interfaces, operating reality, and consequential decisions.",
  ],
  [
    "02",
    "Engineer the proof",
    "Test the integrated system digitally before capital and materials are committed.",
  ],
  [
    "03",
    "Deliver with evidence",
    "Commission against measurable outcomes and preserve an operational record.",
  ],
];

const projects = [
  [
    "North Sea Energy Campus",
    "Esbjerg · Energy",
    "/v11-aznac-parity/project-1.png",
    "project-tile relative overflow-hidden text-left md:col-span-8",
  ],
  [
    "Apex Mobility Works",
    "Pune · Manufacturing",
    "/v11-aznac-parity/project-2.png",
    "project-tile relative overflow-hidden text-left md:col-span-4",
  ],
  [
    "Meridian Control Centre",
    "Singapore · Infrastructure",
    "/v11-aznac-parity/project-3.png",
    "project-tile relative overflow-hidden text-left md:col-span-4",
  ],
  [
    "Solway Research Pier",
    "Glasgow · Marine",
    "/v11-aznac-parity/project-4.png",
    "project-tile relative overflow-hidden text-left md:col-span-6",
  ],
  [
    "Atlas Civic Link",
    "Copenhagen · Transit",
    "/v11-aznac-parity/project-5.png",
    "project-tile relative overflow-hidden text-left md:col-span-6",
  ],
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-label="Arrow">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

function ServiceCard({
  title,
  body,
  image,
}: {
  title: string;
  body: string;
  image: string;
}) {
  return (
    <article className="service-tile relative overflow-hidden border border-white/20 bg-[#031528] text-white">
      <img
        src={image}
        alt={`${title} engineering discipline`}
        className="h-[560px] w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#001326] via-[#001326]/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-8">
        <ArrowIcon />
        <h3 className="mt-8 text-3xl font-semibold">{title}</h3>
        <p className="mt-4 leading-8 text-slate-300">{body}</p>
      </div>
    </article>
  );
}

export default function NorthlineParityWebsite() {
  return (
    <main className="bg-white text-slate-950">
      <header
        id="navbar"
        aria-label="Primary navigation"
        className="absolute inset-x-0 top-0 z-20 border border-white/20 bg-[#001326]/80 px-6 py-5 text-white backdrop-blur-xl lg:px-12"
      >
        <nav className="mx-auto flex max-w-[1500px] items-center justify-between gap-8">
          <a
            href="#hero"
            className="text-xl font-bold uppercase tracking-[-0.04em] text-white"
          >
            NORTHLINE // ENG
          </a>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-xs uppercase tracking-[0.18em]">
              Studio
            </a>
            <a href="#services" className="text-xs uppercase tracking-[0.18em]">
              Capabilities
            </a>
            <a href="#projects" className="text-xs uppercase tracking-[0.18em]">
              Work
            </a>
          </div>
          <a
            href="#contact"
            className="border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.18em]"
          >
            Start a project →
          </a>
        </nav>
      </header>

      <section
        id="hero"
        aria-label="Hero"
        className="relative min-h-[100svh] overflow-hidden bg-[#001326] text-white"
      >
        <img
          src="/v11-aznac-parity/hero.png"
          alt="High performance industrial engineering facility"
          data-media-role="hero-background"
          className="hero-image absolute inset-0 h-full w-full object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001326] via-[#001326]/70 to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1500px] flex-col items-start justify-center gap-8 px-6 py-32 lg:px-12">
          <p className="reveal text-xs font-semibold uppercase tracking-[0.3em] text-[#58a6ff]">
            Integrated engineering · global delivery
          </p>
          <h1 className="reveal max-w-[1050px] text-[58px] font-bold uppercase leading-[0.92] tracking-[-0.05em] text-[#087cff] md:text-[88px]">
            Engineering the systems behind progress.
          </h1>
          <p className="reveal max-w-[560px] text-lg leading-8 text-slate-300">
            Northline resolves complex industrial, energy, and infrastructure
            programs into reliable operating systems.
          </p>
          <a
            href="#about"
            className="reveal border border-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em]"
          >
            Explore Northline →
          </a>
          <div className="flex items-center gap-4">
            <button
              aria-label="Previous slide"
              className="carousel-control border border-white/20 p-4"
            >
              ←
            </button>
            <button
              aria-label="Next slide"
              className="carousel-control border border-white/20 p-4"
            >
              →
            </button>
          </div>
          <div className="flex gap-3">
            <span className="h-2 w-8 bg-[#087cff]" />
            <span className="h-2 w-8 bg-white opacity-60" />
            <span className="h-2 w-8 bg-white opacity-60" />
          </div>
        </div>
      </section>

      <section
        id="about"
        aria-label="About"
        className="bg-white px-6 py-24 lg:px-12 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.26em] text-[#087cff]">
              01 / About Northline
            </p>
            <h2 className="mt-8 text-5xl font-bold uppercase leading-tight tracking-[-0.04em] md:text-7xl">
              One integrated team for consequential work.
            </h2>
            <p className="mt-8 max-w-[560px] text-lg leading-8 text-slate-600">
              We connect strategy, engineering, construction intelligence, and
              commissioning so every decision strengthens the whole asset.
            </p>
            <a
              href="#process"
              className="mt-8 inline-flex border border-slate-950 px-7 py-4 font-semibold"
            >
              How we work →
            </a>
          </div>
          <div className="relative lg:col-span-6 lg:col-start-7">
            <div className="absolute bottom-8 left-[-32px] z-10 bg-[#087cff] p-8 text-white">
              <p className="text-5xl font-bold">32</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em]">
                disciplines connected
              </p>
            </div>
            <img
              src="/v11-aznac-parity/about.png"
              alt="Engineered architectural research campus"
              className="h-[680px] w-full object-cover"
            />
            <div className="pale-wash absolute inset-0" />
          </div>
        </div>
      </section>

      <section
        id="advantages"
        aria-label="Advantages"
        className="bg-[#001326] px-6 py-24 text-white lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1500px] text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#58a6ff]">
            Engineered advantage
          </p>
          <h2 className="mx-auto mt-8 max-w-[900px] text-5xl font-bold uppercase tracking-[-0.04em] md:text-7xl">
            Certainty at every interface.
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-4">
            {advantages.map((item) => (
              <article className="advantage-card border border-white/20 p-8 text-left">
                <p className="text-4xl font-light text-[#58a6ff]">{item[0]}</p>
                <h3 className="mt-12 text-xl font-semibold uppercase">
                  {item[1]}
                </h3>
                <p className="mt-5 leading-8 text-slate-300">{item[2]}</p>
              </article>
            ))}
          </div>
          <a
            href="#contact"
            className="mt-12 inline-flex border border-white px-8 py-4 uppercase tracking-[0.16em]"
          >
            Discuss a program →
          </a>
        </div>
      </section>

      <section
        id="services"
        aria-label="Services"
        className="bg-[#f1f5f9] px-6 py-24 lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <p className="text-xs uppercase tracking-[0.28em] text-[#087cff] lg:col-span-3">
              02 / Capabilities
            </p>
            <h2 className="text-5xl font-bold uppercase tracking-[-0.04em] md:text-7xl lg:col-span-8">
              Depth where disciplines converge.
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((item) => (
              <ServiceCard title={item[0]} body={item[1]} image={item[2]} />
            ))}
          </div>
          <a
            href="#contact"
            className="mt-12 inline-flex border border-slate-950 px-8 py-4 font-semibold"
          >
            View every capability →
          </a>
        </div>
      </section>

      <section
        id="process"
        aria-label="Process"
        className="bg-white px-6 py-24 lg:px-12 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[#087cff]">
              03 / Delivery method
            </p>
            <h2 className="mt-8 text-5xl font-bold uppercase tracking-[-0.04em] md:text-7xl">
              Evidence from first question to live operation.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            {steps.map((step) => (
              <article className="process-step grid grid-cols-1 gap-6 border border-slate-300 p-8 md:grid-cols-4">
                <p className="step-ring rounded-full border border-[#087cff] p-4 text-center text-[#087cff]">
                  {step[0]}
                </p>
                <h3 className="text-2xl font-semibold uppercase">{step[1]}</h3>
                <p className="leading-8 text-slate-600 md:col-span-2">
                  {step[2]}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-20 max-w-[1500px]">
          <img
            src="/v11-aznac-parity/process.png"
            alt="Major engineering construction program"
            className="h-[620px] w-full object-cover"
          />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <p className="max-w-[700px] text-xl leading-8">
              Construction intelligence feeds back into the model, keeping
              delivery connected to intent.
            </p>
            <a href="#projects" className="border border-slate-950 px-8 py-4">
              See delivered work →
            </a>
          </div>
        </div>
      </section>

      <section
        id="projects"
        aria-label="Projects"
        className="bg-[#f1f5f9] px-6 py-24 lg:px-12 lg:py-32"
      >
        <div className="mx-auto max-w-[1500px] text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#087cff]">
            Selected programs
          </p>
          <h2 className="mx-auto mt-8 max-w-[900px] text-5xl font-bold uppercase tracking-[-0.04em] md:text-7xl">
            Built evidence, across scales.
          </h2>
          <div className="project-mosaic mt-16 grid grid-cols-1 gap-6 md:grid-cols-12">
            {projects.map((project) => (
              <article className={project[3]}>
                <img
                  src={project[2]}
                  alt={project[0]}
                  className="h-[420px] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-8 text-white">
                  <h3 className="text-2xl font-semibold">{project[0]}</h3>
                  <p className="mt-2 text-sm uppercase tracking-[0.16em] text-slate-300">
                    {project[1]}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <a
            href="#contact"
            className="mt-12 inline-flex border border-slate-950 px-8 py-4"
          >
            Explore project archive →
          </a>
        </div>
      </section>

      <footer
        id="footer"
        aria-label="Footer"
        className="footer-grid-bg bg-[#000b18] px-6 py-20 text-white lg:px-12"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div>
              <p className="text-2xl font-bold">NORTHLINE // ENG</p>
              <p className="mt-6 leading-8 text-slate-300">
                Integrated engineering for infrastructure that carries
                consequence.
              </p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#58a6ff]">
                Contact
              </h3>
              <p className="mt-6 text-slate-300">
                London · Bengaluru · Singapore · Copenhagen
              </p>
              <a href="mailto:studio@northline.example" className="mt-5 block">
                studio@northline.example
              </a>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#58a6ff]">
                Navigate
              </h3>
              <a href="#about" className="mt-6 block">
                About
              </a>
              <a href="#services" className="mt-4 block">
                Capabilities
              </a>
              <a href="#projects" className="mt-4 block">
                Projects
              </a>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#58a6ff]">
                Follow
              </h3>
              <a href="https://example.com" className="mt-6 block">
                LinkedIn ↗
              </a>
              <a href="https://example.com" className="mt-4 block">
                Instagram ↗
              </a>
            </div>
          </div>
          <div className="mt-16 flex flex-wrap justify-between gap-6 border border-white/20 pt-8 text-xs uppercase tracking-[0.16em] text-slate-300">
            <p>© 2026 Northline Engineering</p>
            <p>Safety · Evidence · Stewardship</p>
          </div>
        </div>
      </footer>

      <style>{`
        .hero-image { transition: transform 16s ease-in-out; transform: scale(1.03); }
        .reveal { animation: parity-rise 800ms ease both; }
        .service-tile img, .project-tile img { transition: transform 700ms ease, filter 700ms ease; }
        .service-tile:hover img, .project-tile:hover img { transform: scale(1.045); filter: saturate(1.1); }
        .advantage-card { transition: transform 260ms ease, background 260ms ease; }
        .advantage-card:hover { transform: translateY(-8px); background: #062644; }
        .carousel-control { transition: background 200ms ease; }
        .carousel-control:hover { background: #087cff; }
        .pale-wash { background: linear-gradient(135deg, rgba(255,255,255,.08), rgba(88,166,255,.13)); }
        .process-step { transition: border-color 240ms ease; }
        .step-ring { transition: border-color 240ms ease; }
        .project-mosaic { transition: opacity 240ms ease; }
        .footer-grid-bg { background-image: linear-gradient(135deg, rgba(88,166,255,.06), transparent 45%); }
        @keyframes parity-rise { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </main>
  );
}
