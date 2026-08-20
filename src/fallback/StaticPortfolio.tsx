import { PROJECTS } from '../data/projects'
import { EXPERIMENTS } from '../data/lab'
import { CERTIFICATIONS, EDUCATION, EXPERIENCE, PERSON, SKILL_GROUPS } from '../data/about'
import { CONTACT } from '../data/contact'

const NAV = [
  { href: '#s-work', label: 'Work' },
  { href: '#s-about', label: 'About' },
  { href: '#s-lab', label: 'Lab' },
  { href: '#s-contact', label: 'Contact' },
]

/**
 * Shown when WebGL is unavailable or the context is lost. Not a stripped-down apology —
 * the same palette, type system and telemetry voice, delivered as a flat document.
 */
export function StaticPortfolio() {
  return (
    <div className="min-h-dvh bg-void">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(120% 80% at 20% 0%, rgba(107,77,255,0.16), transparent 60%), radial-gradient(90% 60% at 90% 10%, rgba(86,233,255,0.1), transparent 55%)',
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 py-16 sm:px-8">
        <header>
          <p className="meta text-ice">Sector 09 · static mode</p>
          <h1 className="font-display mt-5 text-[clamp(2.5rem,10vw,5rem)] text-white">
            {PERSON.name}
          </h1>
          <p className="mt-3 text-sm tracking-[0.3em] text-vapor/70">
            SOFTWARE ENGINEER · CREATIVE DEVELOPER
          </p>
          <p className="mt-6 max-w-prose text-[15px] leading-relaxed text-vapor/80">
            {PERSON.intro}
          </p>
          <p className="meta mt-6">
            This device cannot run the 3D city, so here is the same work as a document.
          </p>
          <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="border-b border-mute/40 py-2 font-mono text-[11px] uppercase tracking-meta text-vapor transition-colors hover:border-ice hover:text-ice"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <section id="s-work" className="mt-16">
          <h2 className="font-display text-2xl text-white">Work</h2>
          <div className="rule my-5" />
          <ol className="space-y-8">
            {PROJECTS.map((project) => (
              <li key={project.id}>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-meta text-ice">
                    {project.index}
                  </span>
                  <h3 className="font-display text-lg text-white">{project.title}</h3>
                </div>
                <p className="meta meta-sm mt-1">
                  {project.category} · {project.year}
                </p>
                <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-vapor/75">
                  {project.description}
                </p>
                {project.metric && (
                  <p className="mt-2 font-mono text-[12px] text-sodium">
                    {project.metric.value}{' '}
                    <span className="meta meta-sm">{project.metric.label}</span>
                  </p>
                )}
                <p className="meta meta-sm mt-2">{project.tech.join(' · ')}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="s-about" className="mt-16">
          <h2 className="font-display text-2xl text-white">About</h2>
          <div className="rule my-5" />
          {EXPERIENCE.map((entry) => (
            <div key={entry.org} className="mb-6">
              <h3 className="font-display text-lg text-white">{entry.org}</h3>
              <p className="meta meta-sm mt-1 text-ice">
                {entry.role} · {entry.period}
              </p>
              <ul className="mt-3 space-y-2">
                {entry.points.map((point) => (
                  <li key={point} className="max-w-prose text-[14px] leading-relaxed text-vapor/75">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <h3 className="font-display text-lg text-white">{EDUCATION.school}</h3>
          <p className="mt-1 text-[14px] text-vapor/75">
            {EDUCATION.degree} · {EDUCATION.detail} · {EDUCATION.period}
          </p>
          <dl className="mt-6 space-y-2">
            {SKILL_GROUPS.map((group) => (
              <div key={group.label} className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
                <dt className="meta meta-sm sm:pt-1">{group.label}</dt>
                <dd className="text-[13px] text-vapor/75">{group.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-6 space-y-1">
            {CERTIFICATIONS.map((cert) => (
              <li key={cert} className="text-[13px] text-vapor/75">
                {cert}
              </li>
            ))}
          </ul>
        </section>

        <section id="s-lab" className="mt-16">
          <h2 className="font-display text-2xl text-white">Lab</h2>
          <div className="rule my-5" />
          <ul className="space-y-6">
            {EXPERIMENTS.map((experiment) => (
              <li key={experiment.id}>
                <p className="font-mono text-[10px] tracking-meta text-signal">
                  {experiment.code} · {experiment.status}
                </p>
                <h3 className="font-display mt-1 text-lg text-white">{experiment.title}</h3>
                <p className="mt-2 max-w-prose text-[14px] leading-relaxed text-vapor/75">
                  {experiment.summary}
                </p>
                <p className="meta meta-sm mt-2">{experiment.tech.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="s-contact" className="mt-16 pb-16">
          <h2 className="font-display text-2xl text-white">Contact</h2>
          <div className="rule my-5" />
          <ul className="space-y-3">
            <li>
              <a className="text-[15px] text-ice" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a className="text-[15px] text-ice" href={CONTACT.github} rel="noreferrer noopener">
                github.com/{CONTACT.githubHandle}
              </a>
            </li>
            <li>
              <a className="text-[15px] text-ice" href={CONTACT.linkedin} rel="noreferrer noopener">
                LinkedIn — {CONTACT.linkedinHandle}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
