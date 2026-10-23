import type { Who } from '../components/Character';

export interface Milestone {
  id: string;
  text: string;
}

export interface Stage {
  id: string;
  title: string;
  who: Who;
  goal: string;
  skills: string[];
  /** Things to build or do. Projects are how employers judge you, not certificates. */
  milestones: Milestone[];
  /** Coding course units that teach this stage inside the app. */
  inApp?: string;
}

export const CAREER: Stage[] = [
  {
    id: 's1',
    title: '1. Foundations',
    who: 'zara',
    goal: 'Think like a programmer and write small programs without help.',
    skills: ['How computers work, binary', 'JavaScript: variables, types, operators', 'Conditions, loops, functions', 'Arrays and objects', 'Problem solving, searching, Big O'],
    milestones: [
      { id: 's1-course', text: 'Finish every Coding lesson in this app' },
      { id: 's1-lab', text: 'Write 5 programs of your own in the Code lab' },
      { id: 's1-daily', text: 'Code 30 days in a row (even 15 minutes counts)' },
    ],
    inApp: 'All five Coding units',
  },
  {
    id: 's2',
    title: '2. The web',
    who: 'maddie',
    goal: 'Build and publish real web pages.',
    skills: ['HTML structure and semantics', 'CSS layout: flexbox, grid, responsive design', 'The DOM and events', 'Git and GitHub', 'Accessibility basics'],
    milestones: [
      { id: 's2-git', text: 'Create a GitHub account and push your first repository' },
      { id: 's2-portfolio', text: 'Build a personal portfolio page and put it online' },
      { id: 's2-clone', text: 'Rebuild the layout of a site you use from scratch' },
    ],
  },
  {
    id: 's3',
    title: '3. Frontend engineer',
    who: 'mei',
    goal: 'Build interactive apps people actually use.',
    skills: ['Modern JavaScript: modules, async/await, fetch', 'TypeScript', 'React components, state and effects', 'Calling APIs', 'Testing your code'],
    milestones: [
      { id: 's3-app', text: 'Build a React app with at least 3 screens' },
      { id: 's3-api', text: 'Build an app that loads live data from a public API' },
      { id: 's3-tests', text: 'Write automated tests for one of your projects' },
    ],
  },
  {
    id: 's4',
    title: '4. Backend & data',
    who: 'greta',
    goal: 'Build the server side: data, logins, APIs.',
    skills: ['Node.js and an HTTP framework', 'SQL databases and data modelling', 'Authentication and passwords done safely', 'REST API design', 'Security basics: never trust user input'],
    milestones: [
      { id: 's4-api', text: 'Build an API with a database and user login' },
      { id: 's4-full', text: 'Connect your React app to your own API' },
      { id: 's4-deploy', text: 'Deploy a full-stack app others can use' },
    ],
  },
  {
    id: 's5',
    title: '5. Professional engineer',
    who: 'ada',
    goal: 'Work like someone a company trusts with production code.',
    skills: ['Data structures and algorithms for interviews', "Reading other people's code", 'Code review and clear pull requests', 'CI/CD and deployment', 'System design basics', 'Communication with non-engineers'],
    milestones: [
      { id: 's5-oss', text: 'Get a pull request merged into an open-source project' },
      { id: 's5-dsa', text: 'Solve 100 algorithm problems' },
      { id: 's5-job', text: 'Apply for internships or junior roles with your portfolio' },
    ],
  },
  {
    id: 's6',
    title: '6. Specialise',
    who: 'tunde',
    goal: 'Go deep in one area while staying broad.',
    skills: ['AI integration in products', 'Mobile apps', 'Cloud and infrastructure', 'Web3 and Telegram mini apps (Academy School 11)', 'Product thinking: build what people need'],
    milestones: [
      { id: 's6-product', text: 'Launch a product that solves a real problem for real users' },
      { id: 's6-teach', text: 'Teach someone else what you know (blog, video, mentoring)' },
    ],
  },
];

export const allMilestones = CAREER.flatMap((s) => s.milestones);
