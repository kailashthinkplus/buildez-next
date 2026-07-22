/** Parsed as untrusted TSX text. Never imported, transpiled, rendered, or executed. */
const capabilities = [
  { title: "Live topology", body: "Map every service and dependency as systems change." },
  { title: "Signal correlation", body: "Group related symptoms into one operational narrative." },
  { title: "Guided resolution", body: "Move from alert to verified repair with shared context." },
  { title: "Release intelligence", body: "Connect customer impact to the change that introduced it." },
];

const Capability = ({ title, body }: { title: string; body: string }) => (
  <article className="rounded-2xl border border-cyan-300/20 bg-slate-900 p-6 hover:-translate-y-1">
    <div className="mb-8 h-10 w-10 rounded-xl bg-cyan-300" />
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="mt-3 leading-8 text-slate-300">{body}</p>
  </article>
);

export default function ModernSaas() {
  return (
    <>
      <section aria-label="Product operations hero" className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white lg:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-8 lg:col-span-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Operational intelligence</p>
            <h1 className="text-5xl font-bold leading-tight md:text-7xl">See every system. Resolve what matters.</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">A shared command layer that turns fragmented telemetry into clear, collaborative decisions.</p>
            <button className="rounded-xl bg-cyan-300 px-7 py-4 font-semibold text-slate-950 shadow-xl hover:-translate-y-1 focus-visible:ring-2">Start exploring</button>
          </div>
          <div className="relative grid grid-cols-2 gap-4 rounded-3xl border border-cyan-300/20 bg-slate-900 p-5 shadow-2xl lg:col-span-6">
            <img src="/v11-fixtures/saas-product-console.svg" alt="Product operations command console" data-media-role="hero-foreground" className="col-span-2 h-80 w-full rounded-2xl object-cover" />
            <div className="rounded-xl bg-slate-950 p-4"><strong className="text-3xl font-bold text-cyan-300">42%</strong><p className="mt-2 text-sm text-slate-300">Faster resolution</p></div>
            <div className="rounded-xl bg-slate-950 p-4"><strong className="text-3xl font-bold text-cyan-300">8.4k</strong><p className="mt-2 text-sm text-slate-300">Signals correlated</p></div>
          </div>
        </div>
      </section>
      <section className="bg-white px-6 py-24 text-slate-950 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2"><h2 className="text-4xl font-bold leading-tight md:text-6xl">A technical workspace built around decisions.</h2><p className="text-lg leading-8 text-slate-600">Structured capability blocks keep the product legible without repeating the cinematic composition of the real-estate fixture.</p></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability) => <Capability title={capability.title} body={capability.body} />)}
          </div>
        </div>
      </section>
    </>
  );
}
