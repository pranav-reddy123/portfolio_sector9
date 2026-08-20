export interface Experiment {
  id: string
  code: string
  title: string
  status: 'Running' | 'Stable' | 'Archived'
  summary: string
  tech: string[]
}

/** The Lab is unfinished work on purpose — status is part of the content. */
export const EXPERIMENTS: Experiment[] = [
  {
    id: 'bedrock-agent',
    code: 'EXP-01',
    title: 'Bedrock troubleshooting agent',
    status: 'Running',
    summary:
      'An agent that reads infrastructure signals during an incident and writes back a probable cause with the checks it ran to get there. The interesting part is deciding which signals are worth showing a model at all.',
    tech: ['Amazon Bedrock', 'CloudWatch', 'Python'],
  },
  {
    id: 'sector-09',
    code: 'EXP-02',
    title: 'This city',
    status: 'Running',
    summary:
      'The whole skyline is four instanced meshes. Windows, rain, and holograms are drawn in shaders rather than geometry, so the city breathes without adding draw calls.',
    tech: ['Three.js', 'GLSL', 'React Three Fiber', 'GSAP'],
  },
  {
    id: 'stream-vs-batch',
    code: 'EXP-03',
    title: 'Streaming vs batch, measured',
    status: 'Stable',
    summary:
      'The same Reddit corpus processed two ways — Spark Structured Streaming against PySpark batch — to find where continuous processing stops paying for itself.',
    tech: ['Spark', 'PySpark', 'Kafka', 'PostgreSQL'],
  },
]
