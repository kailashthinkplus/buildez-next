import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUpRight,
  Blocks,
  BrainCircuit,
  CloudCog,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

const services = [
  {
    number: '01',
    title: 'Legacy modernization',
    description: 'Reframe high-friction systems into an intentional modernization path—balancing architecture, delivery risk and business continuity.',
    tags: ['Architecture assessment', 'Migration strategy', 'Application renewal'],
    icon: Blocks,
  },
  {
    number: '02',
    title: 'Cloud-native platforms',
    description: 'Design resilient platform foundations that make software delivery more repeatable, observable and secure by default.',
    tags: ['Platform engineering', 'Cloud architecture', 'Developer experience'],
    icon: CloudCog,
  },
  {
    number: '03',
    title: 'Applied AI systems',
    description: 'Move from promising experiments to governed AI products shaped around real workflows, reliable data and human oversight.',
    tags: ['AI product strategy', 'Data foundations', 'Responsible delivery'],
    icon: BrainCircuit,
  },
  {
    number: '04',
    title: 'Digital operations',
    description: 'Connect technology, teams and operating practices so transformation can continue beyond a single programme of work.',
    tags: ['Operating models', 'Delivery systems', 'Capability enablement'],
    icon: Network,
  },
]

const transformationSteps = [
  {
    label: 'Read the system',
    copy: 'Map dependencies, constraints and the decisions that created the current environment.',
  },
  {
    label: 'Shape the horizon',
    copy: 'Turn business priorities into a target architecture and a sequenced path to reach it.',
  },
  {
    label: 'Build the bridge',
    copy: 'Deliver in bounded increments while preserving continuity across critical operations.',
  },
  {
    label: 'Transfer the advantage',
    copy: 'Embed practices, platform capabilities and decision frameworks into internal teams.',
  },
]

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="AetherGrid home">
      <span className="brandMark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>AetherGrid</span>
    </a>
  )
}

function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <header className="siteHeader">
      <div className="headerInner">
        <Brand />
        <nav className={open ? 'nav open' : 'nav'} aria-label="Primary navigation">
          <a href="#capabilities" onClick={() => setOpen(false)}>Capabilities</a>
          <a href="#approach" onClick={() => setOpen(false)}>Approach</a>
          <a href="#principles" onClick={() => setOpen(false)}>Principles</a>
          <a className="navCta" href="#contact" onClick={() => setOpen(false)}>
            Start a conversation <ArrowUpRight size={16} />
          </a>
        </nav>
        <button
          className="menuButton"
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}

function SystemVisual() {
  const visualRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = visualRef.current
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const move = (event: PointerEvent) => {
      const bounds = node.getBoundingClientRect()
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10
      node.style.setProperty('--rx', `${-y}deg`)
      node.style.setProperty('--ry', `${x}deg`)
    }
    const reset = () => {
      node.style.setProperty('--rx', '0deg')
      node.style.setProperty('--ry', '0deg')
    }
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerleave', reset)
    return () => {
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerleave', reset)
    }
  }, [])

  return (
    <div className="systemVisual" ref={visualRef} aria-label="Abstract connected technology system">
      <div className="visualHalo" />
      <div className="gridPlane" />
      <div className="orbit orbitOne"><span /></div>
      <div className="orbit orbitTwo"><span /></div>
      <div className="orbit orbitThree"><span /></div>
      <div className="core">
        <span className="coreLabel">AETHER</span>
        <b>01</b>
        <small>COORDINATION LAYER</small>
      </div>
      <div className="signal signalA"><span /> Data</div>
      <div className="signal signalB"><span /> Intelligence</div>
      <div className="signal signalC"><span /> Platform</div>
      <div className="visualCaption">
        <span>System / transformation</span>
        <span>Architecture in motion</span>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="heroNoise" />
      <div className="heroLayout">
        <div className="heroCopy reveal">
          <div className="eyebrow"><span /> Technology consulting for consequential change</div>
          <h1>Complex systems.<br /><em>Clear direction.</em></h1>
          <p>
            AetherGrid brings strategy and engineering into one field—creating practical paths through legacy modernization, cloud platforms, AI and digital operations.
          </p>
          <div className="heroActions">
            <a className="button buttonSignal" href="#capabilities">
              Explore capabilities <ArrowDown size={17} />
            </a>
            <a className="textLink" href="#approach">See how transformation moves <ArrowUpRight size={17} /></a>
          </div>
        </div>
        <div className="heroArt reveal delayOne">
          <SystemVisual />
        </div>
      </div>
      <div className="heroFooter">
        <span>Strategy / Engineering / Enablement</span>
        <span className="heroIndex">AG—01</span>
      </div>
    </section>
  )
}

function Intro() {
  return (
    <section className="intro sectionLight">
      <div className="sectionFrame introGrid">
        <div className="sectionMarker reveal">
          <span>01</span>
          <p>The transformation premise</p>
        </div>
        <div className="introStatement reveal delayOne">
          <Sparkles size={24} strokeWidth={1.5} />
          <h2>Transformation should make complexity <em>legible</em>—not simply move it somewhere new.</h2>
          <p>
            The strongest technology programmes connect architecture to operations, and near-term delivery to a durable destination. Every intervention should leave the system clearer, the platform stronger and the organisation better equipped for what follows.
          </p>
        </div>
      </div>
    </section>
  )
}

function Capabilities() {
  return (
    <section className="capabilities sectionLight" id="capabilities">
      <div className="sectionFrame">
        <div className="sectionHeading reveal">
          <div>
            <span className="kicker">Capability field</span>
            <h2>Work at the points where technology becomes consequential.</h2>
          </div>
          <p>From strategic framing to production systems and the operating practices around them.</p>
        </div>
        <div className="serviceLedger">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <article className="serviceRow reveal" key={service.number}>
                <span className="serviceNumber">{service.number}</span>
                <div className="serviceIcon"><Icon size={25} strokeWidth={1.5} /></div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="serviceTags">
                  {service.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <ArrowUpRight className="serviceArrow" size={21} />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ArchitectureBand() {
  return (
    <section className="architectureBand" aria-label="Integrated consulting model">
      <div className="architectureInner reveal">
        <div className="architectureCopy">
          <span className="kicker light">One connected system</span>
          <h2>Strategy without engineering is a hypothesis.<br />Engineering without context is motion.</h2>
        </div>
        <div className="architectureModel">
          <div className="modelRail" />
          <div className="modelNode nodeStrategy"><b>01</b><span>Strategy</span><small>Direction</small></div>
          <div className="modelNode nodeArchitecture"><b>02</b><span>Architecture</span><small>Decisions</small></div>
          <div className="modelNode nodeDelivery"><b>03</b><span>Delivery</span><small>Momentum</small></div>
          <div className="modelNode nodeOperations"><b>04</b><span>Operations</span><small>Continuity</small></div>
          <div className="modelPulse"><span /></div>
        </div>
      </div>
    </section>
  )
}

function Approach() {
  return (
    <section className="approach sectionLight" id="approach">
      <div className="sectionFrame approachLayout">
        <div className="approachIntro reveal">
          <span className="kicker">A deliberate path</span>
          <h2>Modernize while the business keeps moving.</h2>
          <p>Transformation rarely begins with a blank slate. The approach is designed for active environments—where systems carry history, operations cannot pause and decisions need to create options rather than lock them away.</p>
        </div>
        <div className="steps">
          {transformationSteps.map((step, index) => (
            <article className="step reveal" key={step.label}>
              <div className="stepIndex">0{index + 1}</div>
              <div>
                <h3>{step.label}</h3>
                <p>{step.copy}</p>
              </div>
              <div className="stepSignal" aria-hidden="true"><span /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Principles() {
  return (
    <section className="principles" id="principles">
      <div className="sectionFrame">
        <div className="principleHeader reveal">
          <span className="kicker light">Engineering principles</span>
          <h2>Built for the system after launch.</h2>
        </div>
        <div className="principleComposition">
          <div className="principleLead reveal">
            <div className="leadSymbol"><ShieldCheck size={44} strokeWidth={1.2} /></div>
            <h3>Durability is a design decision.</h3>
            <p>Architecture should remain understandable under pressure. Platforms should support change without inviting chaos. AI should include governance as part of the product, not as a final review.</p>
          </div>
          <div className="principleList">
            <div className="principleItem reveal">
              <span>01 / Clarity</span>
              <h3>Make decisions visible</h3>
              <p>Expose constraints, trade-offs and ownership so teams can move with shared context.</p>
            </div>
            <div className="principleItem reveal">
              <span>02 / Resilience</span>
              <h3>Design for real conditions</h3>
              <p>Plan for operational pressure, evolving requirements and imperfect dependencies.</p>
            </div>
            <div className="principleItem reveal">
              <span>03 / Agency</span>
              <h3>Leave capability behind</h3>
              <p>Create systems and practices that internal teams can understand, operate and extend.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contactGrid">
        <div className="contactIndex">NEXT / 01</div>
        <div className="contactCopy reveal">
          <span className="kicker">Begin with the difficult question</span>
          <h2>What needs to become possible?</h2>
          <p>Bring the system that is holding progress back, the platform that needs a new foundation or the AI opportunity that needs a responsible path into production.</p>
          <a className="button buttonDark" href="#capabilities">
            Frame the opportunity <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="contactOrb" aria-hidden="true">
          <div /><span>AG</span>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footerTop">
        <Brand />
        <p>Technology strategy and engineering for complex transformation.</p>
        <a className="backTop" href="#top">Back to top <ArrowUpRight size={16} /></a>
      </div>
      <div className="footerBottom">
        <span>© {new Date().getFullYear()} AetherGrid</span>
        <span>Legacy modernization / Cloud platforms / Applied AI / Digital operations</span>
      </div>
    </footer>
  )
}

function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="siteShell">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach((element) => element.classList.add('visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <SiteShell>
      <Hero />
      <Intro />
      <Capabilities />
      <ArchitectureBand />
      <Approach />
      <Principles />
      <Contact />
    </SiteShell>
  )
}
