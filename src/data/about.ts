export const PERSON = {
  name: 'Pranav Reddy',
  fullName: 'S. Pranav Reddy',
  roles: ['Software engineer', 'Creative developer'],
  location: 'Bangalore, India',
  intro:
    'I build systems that stay up. At Amazon I worked on cloud infrastructure that has to explain itself when it breaks — health checks, diagnostics, automated recovery. Away from that I build things on the web that move: real-time apps, streaming pipelines, and rendering experiments like the city you are travelling through.',
  interests: [
    'Infrastructure that diagnoses itself',
    'Real-time systems and streaming data',
    'Real-time rendering on the web',
    'Applied AI on top of operational signals',
  ],
} as const

export interface ExperienceEntry {
  org: string
  role: string
  period: string
  location: string
  points: string[]
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    org: 'Amazon',
    role: 'Cloud Support Engineer Intern',
    period: 'Feb 2026 — Jul 2026',
    location: 'Bangalore, India',
    points: [
      'Debugged AWS applications and infrastructure across networking, load balancing, compute, and service health.',
      'Designed an ELB health-check intelligence system that detects failures and runs recovery automatically.',
      'Built an AI troubleshooting agent on Amazon Bedrock that reads infrastructure signals and proposes root causes.',
      'Cut manual diagnosis effort by 82% by automating the diagnosis-to-recovery path.',
    ],
  },
]

export const EDUCATION = {
  school: 'B.M.S. College of Engineering',
  degree: 'B.E. Computer Science and Engineering',
  period: 'Dec 2022 — Jun 2026',
  location: 'Bangalore, India',
  detail: 'CGPA 9.13',
}

export const CERTIFICATIONS = [
  'AWS Certified Solutions Architect — Associate',
  'AWS Certified AI Practitioner',
]

export const SKILL_GROUPS: { label: string; items: string[] }[] = [
  { label: 'Languages', items: ['C++', 'SQL', 'TypeScript', 'JavaScript'] },
  {
    label: 'Software development',
    items: ['React', 'Node.js', 'Express', 'REST APIs', 'Socket.io', 'JWT', 'Tailwind CSS'],
  },
  {
    label: 'Cloud & systems',
    items: ['EC2', 'ELB', 'Auto Scaling', 'EventBridge', 'CloudWatch', 'Networking', 'Monitoring'],
  },
  {
    label: 'Core CS',
    items: ['Data structures', 'Algorithms', 'OOP', 'Operating systems', 'DBMS'],
  },
  { label: 'Data & AI', items: ['Amazon Bedrock', 'Apache Kafka', 'Apache Spark', 'MongoDB'] },
  { label: 'Tools', items: ['Git', 'Postman'] },
]
