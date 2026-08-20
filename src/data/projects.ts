export interface Project {
  id: string
  index: string
  title: string
  category: string
  year: string
  /** Two sentences maximum — the city is the story, the card is the caption. */
  description: string
  tech: string[]
  /** Headline result, shown as a mono readout on the card. */
  metric?: { value: string; label: string }
}

export const PROJECTS: Project[] = [
  {
    id: 'elb-remediation',
    index: '01',
    title: 'ELB Health Check Intelligence',
    category: 'Cloud reliability',
    year: '2026',
    description:
      'Built at Amazon to catch load balancer health-check failures before a human sees them. It reads diagnostic signals, works out what actually broke, and runs the recovery workflow itself.',
    tech: ['AWS ELB', 'EC2', 'Auto Scaling', 'EventBridge', 'CloudWatch'],
    metric: { value: '82%', label: 'less manual diagnosis' },
  },
  {
    id: 'chatorbit',
    index: '02',
    title: 'ChatOrbit',
    category: 'Real-time application',
    year: '2025',
    description:
      'A full-stack messaging app with live presence and instant delivery over Socket.io. Authentication, messaging, and user management run on REST APIs behind JWT.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.io', 'JWT', 'Zustand'],
  },
  {
    id: 'imaginix',
    index: '03',
    title: 'Imaginix',
    category: 'AI product',
    year: '2025',
    description:
      'Turns a written prompt into an image, then puts it in a community gallery others can search, share, and download. Cloudinary handles storage so the app stays fast as the gallery grows.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'DALL·E API', 'Cloudinary'],
  },
  {
    id: 'reddit-streaming',
    index: '04',
    title: 'Reddit Streaming Analysis',
    category: 'Data engineering',
    year: '2025',
    description:
      'A pipeline that reads Reddit posts as they arrive and scores their sentiment in flight with Spark Structured Streaming. The same data is processed again in batch to measure what streaming actually costs and saves.',
    tech: ['Kafka', 'Spark', 'PySpark', 'PostgreSQL', 'PRAW', 'VADER'],
  },
]
