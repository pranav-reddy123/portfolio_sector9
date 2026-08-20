import { Panel } from '../ui/Panel'
import { useStore } from '../../hooks/useStore'
import { EXPERIMENTS } from '../../data/lab'

const STATUS_COLOR: Record<string, string> = {
  Running: 'text-signal',
  Stable: 'text-ice',
  Archived: 'text-mute',
}

export function Lab() {
  const active = useStore((s) => s.section) === 'lab'

  return (
    <Panel id="lab" code="Tower 03 · Kiln" title="Lab" active={active} side="right">
      <p className="text-[13px] leading-relaxed text-vapor/75">
        Work that is still moving. Nothing here is finished, which is the point.
      </p>

      <ul className="mt-5 space-y-4">
        {EXPERIMENTS.map((experiment) => (
          <li key={experiment.id} className="scanlines border border-mute/20 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] tracking-meta text-signal">
                {experiment.code}
              </span>
              <span
                className={`font-mono text-[9px] uppercase tracking-meta ${
                  STATUS_COLOR[experiment.status]
                }`}
              >
                ● {experiment.status}
              </span>
            </div>
            <h3 className="mt-2 font-display text-base text-white">{experiment.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-vapor/75">{experiment.summary}</p>
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {experiment.tech.map((tech) => (
                <li key={tech} className="meta meta-sm">
                  {tech}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
