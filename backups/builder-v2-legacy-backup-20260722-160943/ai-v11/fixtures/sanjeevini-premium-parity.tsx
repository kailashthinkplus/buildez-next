const projects = [
  { name: "Sanjeevini Vaibhav", detail: "1170–1665 sq.ft. · 2 & 3 BHK", image: "/v11-sanjeevini-live/vaibhav.jpg" },
  { name: "Sanjeevini Srushti", detail: "935–1245 sq.ft. · 2, 2.5 & 3 BHK", image: "/v11-sanjeevini-live/srushti.jpg" },
  { name: "Srushti Srigandha", detail: "8.09 acres · 134 villa plots", image: "/v11-sanjeevini-live/srigandha.jpg" },
];

const metrics = [
  { value: "8+", label: "Projects delivered" },
  { value: "1.5M", label: "Developed so far" },
  { value: "3M", label: "Currently in progress" },
  { value: "1,200+", label: "Satisfied customers" },
];

export default function SanjeeviniLiveParity() {
  return (
    <main className="bg-[#191919] text-[#f5f2eb]">
      <section aria-label="primary-navigation" className="border-b border-[#c89428]/20 bg-[#171717] px-5 py-4 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
          <div className="flex items-center"><img src="/v11-sanjeevini-live/logo.png" alt="Sanjeevini Group" className="h-10 w-32 object-contain" /></div>
          <nav aria-label="primary-navigation" className="hidden items-center gap-7 text-xs text-white/70 lg:flex">
            <a href="#top">Home</a><a href="#about">Who We Are</a><a href="#expertise">Expertise</a><a href="#projects">Projects</a><a href="#testimonials">Testimonials</a><a href="#contact">Get in Touch</a>
          </nav>
          <a href="#contact" className="rounded-full border border-[#c89428] px-5 py-2 text-xs text-[#e3b13e]">Book Site Visit →</a>
        </div>
      </section>

      <section id="top" aria-label="hero" className="relative min-h-[700px] overflow-hidden">
        <img src="/v11-sanjeevini-live/hero.webp" alt="Sanjeevini villa community surrounded by Bengaluru landscape" data-media-role="hero-foreground" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-black/50" />
        <div className="relative mx-auto flex min-h-[700px] max-w-7xl items-center px-6 py-24 lg:px-12">
          <div className="ml-auto max-w-xl text-center lg:mr-16">
            <p className="font-serif text-4xl italic text-[#d7a51e] md:text-6xl">Buried for buds,</p>
            <h1 className="mt-2 font-serif text-5xl leading-tight text-white md:text-7xl">Nestled in Nature,<br />Rooted in Harmony.</h1>
            <p className="mt-6 text-xs uppercase tracking-[0.32em] text-white/70">Luxurious villas · Bhaktharahalli, Bengaluru</p>
            <a href="#projects" className="mt-9 inline-block border-b border-[#d7a51e] pb-2 text-sm text-[#f0ca6a]">Explore residences</a>
          </div>
        </div>
      </section>

      <section id="about" className="bg-gradient-to-br from-[#214158] to-[#17191c] px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6"><p className="font-serif text-3xl italic text-[#d8a529]">Welcome to</p><h2 className="font-serif text-5xl md:text-7xl">Sanjeevini Group</h2><p className="mt-7 max-w-xl leading-8 text-white/65">Customer-centric homes for enhanced living. Latest construction technology for on-time delivery. We craft homes that reflect your lifestyle.</p><a href="#expertise" className="mt-8 inline-block rounded-full border border-[#d8a529] px-6 py-3 text-sm text-[#edc85e]">Learn More →</a></div>
          <div className="lg:col-span-6"><img src="/v11-sanjeevini-live/vision.png" alt="We build your visions to reality" data-media-role="editorial-image" className="w-full object-contain" /></div>
          <div className="grid grid-cols-2 gap-8 border-t border-white/15 pt-10 lg:col-span-12 lg:grid-cols-4">
            {metrics.map((metric) => <div key={metric.label}><p className="text-4xl font-semibold">{metric.value}</p><p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{metric.label}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#232323] px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div><p className="text-2xl text-[#d3a12a]">At Sanjeevini Group</p><p className="mt-6 max-w-xl leading-8 text-white/65">We combine creativity and expertise to design homes that elevate your living experience while staying true to our commitments.</p><img src="/v11-sanjeevini-live/logo.png" alt="Sanjeevini Group embossed identity" className="mt-12 h-16 w-48 object-contain" /></div>
          <img src="/v11-sanjeevini-live/expertise.png" alt="Architectural skyline expressing Sanjeevini expertise" data-media-role="editorial-image" className="h-80 w-full object-contain opacity-75" />
        </div>
      </section>

      <section id="expertise" className="bg-[#171717] px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5"><h2 className="text-3xl leading-tight text-[#d4a129]">Committed to crafting a sustainable lifestyle in every detail</h2><p className="mt-14 font-serif italic text-[#d4a129]">Our Expertise</p><p className="mt-5 max-w-md leading-7 text-white/55">Committed to excellence, precision, and timeliness, we deliver durable, aesthetic, and functional residential, commercial, and infrastructure projects.</p><div className="mt-9 flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c89018] text-black">←</span><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c89018] text-black">→</span></div></div>
          <div className="lg:col-span-7"><img src="/v11-sanjeevini-live/interiors.jpg" alt="Refined residential interior by Sanjeevini Group" data-media-role="editorial-image" className="h-[620px] w-full object-cover" /></div>
        </div>
      </section>

      <section id="projects" className="bg-[#222] px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl"><p className="text-center font-serif text-lg italic text-[#d1a026]">Our Projects</p><div className="mt-5 flex flex-wrap justify-center gap-6 text-xs text-white/55"><span className="text-[#d1a026]">All</span><span>Commercial</span><span>Upcoming</span><span>Ongoing</span><span>Completed</span></div>
          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {projects.map((project, index) => <article key={project.name} className={index === 0 ? "relative overflow-hidden lg:col-span-6" : "relative overflow-hidden lg:col-span-3"}><img src={project.image} alt={`${project.name} residential development`} data-media-role="editorial-image" className="h-[520px] w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-6 pb-7 pt-20"><h3 className="font-serif text-2xl">{project.name}</h3><p className="mt-2 text-xs text-white/60">{project.detail}</p></div></article>)}
          </div>
          <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center"><div><h2 className="text-3xl text-[#d1a026]">Progressive Spaces for a better Tomorrow</h2></div><div className="flex justify-end gap-3 text-[#d1a026]"><span>←</span><span>→</span></div></div>
        </div>
      </section>

      <section id="testimonials" className="relative overflow-hidden bg-[#202020] px-6 py-28 lg:px-12 lg:py-40">
        <div className="absolute left-10 top-10 h-[520px] w-[520px] rounded-full border-[70px] border-dotted border-white/10" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center"><div className="lg:col-span-5"><p className="text-2xl text-[#d1a026]">More than 1200 families have chosen Sanjeevini Group</p></div><blockquote className="bg-[#333] p-8 lg:col-span-7"><p className="text-xs uppercase tracking-[0.2em] text-[#d1a026]">Testimonial</p><p className="mt-5 leading-7 text-white/70">Buying my first apartment with Sanjeevini Group was smooth and transparent. The construction quality is excellent, and the team was responsive to all my queries and provided regular updates.</p><p className="mt-6 text-sm font-semibold">Priya Narayan · Software Engineer</p></blockquote></div>
      </section>

      <section id="contact" className="bg-[#242424] px-6 py-20 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-12"><div className="lg:col-span-6"><h2 className="text-3xl">Get in <span className="font-serif italic text-[#d2a028]">Touch</span></h2><div className="mt-10 grid grid-cols-2 gap-5"><div className="border-b border-[#c59122] pb-3 text-sm text-white/35">First name</div><div className="border-b border-[#c59122] pb-3 text-sm text-white/35">Last name</div><div className="col-span-2 border-b border-[#c59122] pb-3 text-sm text-white/35">Phone</div><div className="col-span-2 border-b border-[#c59122] pb-3 text-sm text-white/35">Email</div><div className="col-span-2 border-b border-[#c59122] pb-3 text-sm text-white/35">Purpose</div><div className="col-span-2 h-32 rounded-2xl border border-[#c59122] p-4 text-sm text-white/35">Message</div></div><a href="#top" className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#c68c16] text-2xl text-white">→</a></div><div className="flex items-center justify-center bg-[#e9e4d8] p-10 lg:col-span-6"><div className="text-center text-[#2a2a2a]"><p className="text-xs uppercase tracking-[0.25em]">Whitefield · Bengaluru</p><p className="mt-5 font-serif text-4xl">Come see where<br />the next chapter begins.</p><a href="#top" className="mt-7 inline-block border-b border-[#2a2a2a] pb-2 text-sm">Return to residences</a></div></div></div>
      </section>

      <section aria-label="footer" className="relative overflow-hidden bg-[#202020] px-6 pb-10 pt-16 lg:px-12">
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 border-b border-white/15 pb-14 md:grid-cols-3"><div><img src="/v11-sanjeevini-live/logo.png" alt="Sanjeevini Group" className="h-14 w-44 object-contain" /><div className="mt-8 flex gap-4 text-[#d19a22]"><span>Instagram</span><span>YouTube</span></div></div><div><p className="text-sm font-semibold">Our Projects</p><p className="mt-5 leading-7 text-white/45">Upcoming<br />Ongoing<br />Completed</p></div><div><p className="text-sm font-semibold">Address</p><p className="mt-5 text-sm leading-7 text-white/45">Sanjeevini Properties Pvt Ltd<br />Ramagondanahalli, Whitefield<br />Bengaluru 560066</p><p className="mt-6 text-white/70">+91 80 951 52444<br />info@sanjeevinigroups.com</p></div></div>
        <p className="pointer-events-none absolute -bottom-12 left-0 text-[12rem] font-black tracking-tighter text-white/[0.035] lg:text-[17rem]">SANJEEVINI</p><div className="relative z-10 mx-auto mt-7 flex max-w-7xl justify-between text-xs text-white/35"><p>Copyright © 2026 Sanjeevini Group</p><p>Homes designed for Bengaluru.</p></div>
      </section>
    </main>
  );
}
