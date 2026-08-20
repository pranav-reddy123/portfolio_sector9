import { Panel } from '../ui/Panel'
import { PROJECTS } from '../../data/projects'
import { useStore } from '../../hooks/useStore'

export function Work() {
  const active = useStore((s) => s.section) === 'work'

  return (
    <Panel id="work" code="Tower 01 · Foundry" title="Selected work" active={active} side="right">
      <ol className="space-y-4">
        {PROJECTS.map((project) => (
          <li key={project.id} className="border-t border-mute/20 pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[10px] tracking-meta text-ice">{project.index}</span>
              <h3 className="font-display text-base text-white">{project.title}</h3>
            </div>
            <p className="meta meta-sm mt-1">
              {project.category} · {project.year}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-vapor/75">{project.description}</p>
            {project.metric && (
              <p className="mt-2 font-mono text-[11px] text-sodium">
                <span className="tabular-nums">{project.metric.value}</span>{' '}
                <span className="text-mute uppercase tracking-meta text-[9px]">
                  {project.metric.label}
                </span>
              </p>
            )}
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {project.tech.map((tech) => (
                <li key={tech} className="meta meta-sm text-mute">
                  {tech}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
