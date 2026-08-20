import { Panel } from '../ui/Panel'
import { useStore } from '../../hooks/useStore'
import { CERTIFICATIONS, EDUCATION, EXPERIENCE, PERSON, SKILL_GROUPS } from '../../data/about'

export function About() {
  const active = useStore((s) => s.section) === 'about'

  return (
    <Panel id="about" code="Tower 02 · Origin" title="Operator record" active={active} side="left">
      <p className="text-[13px] leading-relaxed text-vapor/80">{PERSON.intro}</p>

      <div className="rule my-5" />

      {EXPERIENCE.map((entry) => (
        <div key={entry.org}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-sm text-white">{entry.org}</h3>
            <span className="meta meta-sm">{entry.period}</span>
          </div>
          <p className="meta meta-sm mt-1 text-ice">{entry.role}</p>
          <ul className="mt-3 space-y-2">
            {entry.points.map((point) => (
              <li key={point} className="flex gap-3 text-[13px] leading-relaxed text-vapor/75">
                <span aria-hidden="true" className="mt-[7px] h-px w-3 shrink-0 bg-mute/60" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="rule my-5" />

      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-sm text-white">{EDUCATION.school}</h3>
        <span className="meta meta-sm">{EDUCATION.period}</span>
      </div>
      <p className="mt-1 text-[13px] text-vapor/75">
        {EDUCATION.degree} · <span className="text-sodium">{EDUCATION.detail}</span>
      </p>

      <div className="rule my-5" />

      <h3 className="meta mb-3">Skills</h3>
      <dl className="space-y-2">
        {SKILL_GROUPS.map((group) => (
          <div key={group.label} className="grid grid-cols-[7rem_1fr] gap-3">
            <dt className="meta meta-sm pt-[3px]">{group.label}</dt>
            <dd className="text-[12px] leading-relaxed text-vapor/70">{group.items.join(' · ')}</dd>
          </div>
        ))}
      </dl>

      <div className="rule my-5" />

      <h3 className="meta mb-2">Certified</h3>
      <ul className="space-y-1">
        {CERTIFICATIONS.map((cert) => (
          <li key={cert} className="text-[12px] text-vapor/75">
            {cert}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
