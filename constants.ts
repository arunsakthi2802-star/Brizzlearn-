import { CareerPath, Difficulty, Project, Article, Job } from './types';

export const INITIAL_PATHS: CareerPath[] = [
  {
    id: 'web-dev',
    title: 'Full Stack Systems Architect',
    description: 'A complete trajectory from raw HTML to cloud-native deployments.',
    nodes: [
      {
        id: 'foundations',
        title: 'Level 0: Digital Foundations',
        description: 'Master the core protocols of the internet and document structure.',
        status: 'unlocked',
        topics: ['HTTP/HTTPS Protocols', 'Semantic HTML5', 'SEO Basics'],
        resources: [
          { id: 't1-yt', type: 'youtube', category: 'free', title: 'HTTP Explained', provider: 'Fireship', url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0' },
          { id: 't1-pdf', type: 'pdf', category: 'free', title: 'HTTP Manual', provider: 'Mozilla', url: '#' },
          { id: 't1-c', type: 'course', category: 'paid', title: 'Networking Fundamentals', provider: 'Pluralsight', url: '#' }
        ],
        proTips: 'Always start with a sketch before writing a single line of HTML.'
      },
      {
        id: 'logic-architect',
        title: 'Level 1: Logic Architect',
        description: 'Implement complex computational logic using modern JavaScript engines.',
        status: 'locked',
        topics: ['ES6+ Syntax', 'Asynchronous Control', 'DOM Manipulation'],
        resources: [
          { id: 't2-yt', type: 'youtube', category: 'free', title: 'JS Pro Tips', provider: 'Fireship', url: '#' },
          { id: 't2-pdf', type: 'pdf', category: 'free', title: 'Modern JS Guide', provider: 'Eloquent JS', url: '#' },
          { id: 't2-c', type: 'course', category: 'paid', title: 'JS Masterclass', provider: 'Udemy', url: '#' }
        ],
        proTips: 'Avoid "Callback Hell" by mastering Promises and Async/Await early.'
      },
      {
        id: 'reactive-ui',
        title: 'Level 2: Reactive UI Design',
        description: 'Construct high-performance, reactive interfaces with the React ecosystem.',
        status: 'locked',
        topics: ['Component Lifecycle', 'State Management', 'Hooks API', 'Virtual DOM Concepts'],
        resources: [
          { id: 't3-yt', type: 'youtube', category: 'free', title: 'React in 100 Seconds', provider: 'Fireship', url: '#' },
          { id: 't3-pdf', type: 'pdf', category: 'free', title: 'React Beta Docs', provider: 'Facebook', url: '#' }
        ],
        proTips: 'Keep your state as local as possible to avoid unnecessary re-renders.'
      },
      {
        id: 'fullstack-nexus',
        title: 'Level 3: Full-Stack Nexus',
        description: 'Bridge client and server with specialized API design and database modeling.',
        status: 'locked',
        topics: ['Node.js Runtime', 'REST & GraphQL', 'PostgreSQL Modeling', 'Auth Patterns'],
        resources: [
          { id: 't4-yt', type: 'youtube', category: 'free', title: 'SQL for Beginners', provider: 'FreeCodeCamp', url: '#' },
          { id: 't4-c', type: 'course', category: 'paid', title: 'Node Production Apps', provider: 'Frontend Masters', url: '#' }
        ],
        proTips: 'Database schema design is more important than the code that queries it.'
      },
      {
        id: 'cloud-continuum',
        title: 'Level 4: Cloud Continuum',
        description: 'Deploy systems to global cloud infrastructure with CI/CD and DevOps.',
        status: 'locked',
        topics: ['Docker Containerization', 'AWS S3/EC2', 'GitHub Actions', 'Terraform Basics'],
        resources: [
          { id: 't5-yt', type: 'youtube', category: 'free', title: 'Docker Tutorial', provider: 'Programming with Mosh', url: '#' }
        ],
        proTips: 'If you can containerize it, you can scale it anywhere.'
      },
      {
        id: 'apex-mastery',
        title: 'Level 5: Apex Mastery',
        description: 'Performance tuning, security hardening, and high-level systems architecture.',
        status: 'locked',
        topics: ['Microservices', 'System Design', 'Cybersecurity Hardening', 'Distributed Systems'],
        resources: [
          { id: 't6-yt', type: 'youtube', category: 'free', title: 'System Design 101', provider: 'ByteByteGo', url: '#' }
        ],
        proTips: 'Seniority is about knowing when NOT to use a certain technology.'
      }
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    tier: 1,
    title: 'Personal Portfolio',
    description: 'A responsive website showcasing your bio and projects.',
    tech: ['HTML', 'CSS', 'Flexbox'],
    phases: [
      { 
        id: 'ph1', 
        title: 'Structure', 
        tasks: ['Set up boilerplate', 'Create Nav bar', 'Add Hero section'],
        details: 'Start with a standard HTML5 boilerplate. Utilize semantic tags like <header>, <nav>, and <main> to define the core skeleton of your portfolio for better accessibility.'
      },
      { 
        id: 'ph2', 
        title: 'Styling', 
        tasks: ['Add color palette', 'Make it responsive', 'Custom fonts'],
        details: 'Apply a mobile-first design philosophy using CSS Flexbox. Define a cohesive color palette and implement responsive media queries to ensure the UI adapts to various screen dimensions.'
      }
    ]
  }
];

export const ARTICLES: Article[] = [
  { id: 'a1', title: 'React 19: The Compiler Era', summary: 'How React is removing the need for manual memoization.', tag: 'web-dev', date: 'Just now', url: '#', source: 'The Verge' },
  { id: 'a2', title: 'NVIDIA Blackwell Delay Concerns', summary: 'Impact on AI data center expansion in Q3.', tag: 'ai', date: '2 mins ago', url: '#', source: 'Reuters' },
  { id: 'a3', title: 'TypeScript 5.6 Released', summary: 'Iterables and non-nullish checks improvements.', tag: 'web-dev', date: '5 mins ago', url: '#', source: 'Microsoft Dev Blog' }
];

export const JOBS: Job[] = [
  { 
    id: 'j1', 
    company: 'Google', 
    role: 'Frontend Engineering Intern', 
    location: 'Remote / Mountain View', 
    requiredNodes: ['foundations', 'styling'], 
    salary: '$6,500 /mo',
    category: 'internship',
    description: 'Work with the Chrome team to build next-generation web interfaces.',
    eligibility: ['Currently enrolled in CS degree', 'Proficiency in HTML/CSS', 'Basic JS knowledge'],
    applyUrl: 'https://careers.google.com'
  },
  { 
    id: 'j2', 
    company: 'Stripe', 
    role: 'Junior Full Stack Engineer', 
    location: 'Remote (US/EU)', 
    requiredNodes: ['foundations', 'styling', 'js-logic'], 
    salary: '$120k - $145k',
    category: 'job',
    description: 'Help build the financial infrastructure of the internet.',
    eligibility: ['0-2 years experience', 'Experience with Node.js', 'React proficiency'],
    applyUrl: 'https://stripe.com/jobs'
  }
];