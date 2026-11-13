export const displayName = 'Antonio Ospina';

export const description =
  'Frontend Tech Lead at EPAM Systems. React, Next.js, and React Native for airline booking and payments.';

export const links = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/antonio-ospina/' },
  { label: 'GitHub', href: 'https://github.com/saospina' },
  { label: 'Medium', href: 'https://medium.com/@sergos0617' },
] as const;

export const whatsapp = {
  label: 'Message me on WhatsApp',
  handle: 'ospinasa.music',
  href: 'https://wa.me/ospinasa.music',
} as const;

export type ProfileLink = (typeof links)[number];

export type ExperienceRole = {
  title: string;
  period?: string;
  note?: string;
  points: string[];
};

export type ExperienceJob = {
  company: string;
  meta: string;
  roles: ExperienceRole[];
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export type EducationItem = {
  school: string;
  credential: string;
  period: string;
};

export type WorkItem = {
  title: string;
  context: string;
  points: string[];
};

export type ProfileSection = {
  id: 'about' | 'skills' | 'experience' | 'projects' | 'interests' | 'contact';
  title: string;
  shortDescription: string;
  body?: string;
  points?: string[];
  accentColor: string;
  stringIndex: number;
  navLabel: string;
  note: string;
};

export const headline = 'Frontend Tech Lead · EPAM Systems · Medellín, Colombia';

export const pageTitle = 'Antonio Ospina — Frontend Tech Lead (React, Next.js)';

export const tagline =
  'I lead frontend engineering for Copa Airlines’ booking and payments platform. 10+ years in software, from QA automation to tech leadership.';

export const guitarCaption = 'This is my résumé. Each string opens a section: pluck one, or just scroll.';

export const experience: ExperienceJob[] = [
  {
    company: 'EPAM Systems',
    meta: 'Colombia · Mar 2020 – Present',
    roles: [
      {
        title: 'Frontend Tech Lead',
        period: 'Jan 2026 – Present',
        points: [
          'Lead the frontend team for Copa Airlines’ booking and payments platform on React, Redux, and Next.js.',
          'Set coding standards, run reviews, and manage technical debt across the codebase.',
          'Mentor developers. Two engineers have grown into senior roles.',
          'Plan sprints and unblock the team as the technical point of contact.',
          'Evaluate AI developer tooling, including agentic coding and MCP integrations.',
        ],
      },
      {
        title: 'Frontend Developer',
        period: 'Feb 2021 – Jan 2026',
        points: [
          'Shipped payment methods in the Copa Airlines booking flow: Uplift, PayPal, PSE, SafetyPay, and card.',
          'Integrated those providers on React, Redux, and Next.js.',
          'Reviewed code, guided architecture, and kept the platform scalable as the team grew.',
        ],
      },
      {
        title: 'Quality Assurance Engineer',
        period: 'Mar 2020 – Feb 2021',
        note: 'Joined through S4N, later part of EPAM.',
        points: [
          'Built Cypress and Cucumber suites for React applications.',
          'Worked across the delivery lifecycle, then moved into frontend after leading within the QA group.',
        ],
      },
    ],
  },
  {
    company: 'Yuxi Global',
    meta: 'Medellín · Nov 2017 – Mar 2020',
    roles: [
      {
        title: 'Quality Assurance Engineer',
        points: [
          'Tested Angular frontends and backend services with Postman, Git, SQL, Jira, and TestRail.',
          'Supported clients including Apex and IQVIA.',
        ],
      },
    ],
  },
  {
    company: 'Tata Consultancy Services',
    meta: 'Medellín · Jan 2016 – Nov 2017',
    roles: [
      {
        title: 'Quality Assurance Engineer',
        points: [
          'Led a certification team for banking systems on IBM applications.',
          'Worked with SQL, RPG, Jira, and Quality Center.',
        ],
      },
    ],
  },
  {
    company: 'Unisys',
    meta: 'Rionegro · May 2012 – Jan 2016',
    roles: [
      {
        title: 'Bilingual agent',
        points: [],
      },
    ],
  },
];

export const skills: SkillGroup[] = [
  {
    label: 'Frontend',
    items: ['React', 'Next.js', 'React Native', 'Redux', 'TypeScript', 'JavaScript'],
  },
  {
    label: 'Quality',
    items: ['Cypress', 'Cucumber', 'SQL', 'Requirements engineering'],
  },
  {
    label: 'Practice',
    items: ['Architecture', 'Code review', 'Mentoring', 'Git'],
  },
];

export const education: EducationItem[] = [
  {
    school: 'Uniremington',
    credential: 'Engineer’s degree, Systems Engineering',
    period: '2016',
  },
  {
    school: 'Colombo Americano',
    credential: 'Teaching English as a Second or Foreign Language',
    period: '2018 – 2020',
  },
];

export const selectedWork: WorkItem[] = [
  {
    title: 'Payments in the Copa Airlines booking flow',
    context: 'EPAM Systems · React, Redux, Next.js',
    points: [
      'Shipped Uplift, PayPal, PSE, SafetyPay, and card payments in the booking flow.',
      'Integrated each provider into one checkout on React, Redux, and Next.js.',
    ],
  },
  {
    title: 'Growing the frontend team',
    context: 'EPAM Systems · Frontend Tech Lead',
    points: [
      'Set coding standards, run reviews, and manage technical debt.',
      'Mentored developers. Two engineers have grown into senior roles.',
    ],
  },
  {
    title: 'This site',
    context: 'Astro, inline SVG, GSAP, Web Audio',
    points: [
      'A static Astro page with a hand-built SVG guitar as the section navigation.',
      'Sound is optional and never autoplays. Mobile gets a plain section bar, and every section is reachable by keyboard.',
    ],
  },
];

export const certifications = [
  'Learning the OWASP Top 10',
  'Foundational JavaScript Security',
  'OWASP Top 10: Injection and Broken Authentication',
  'Seguridad web esencial',
  'React: de cero a experto (Hooks y MERN)',
];

const ink = '#1c1916';
const muted = '#5c564e';
const accent = '#1a4741';

export const sections: ProfileSection[] = [
  {
    id: 'about',
    title: 'About Me',
    navLabel: 'About',
    note: 'D3',
    shortDescription: 'Frontend Tech Lead at EPAM Systems, in Medellín.',
    points: [
      'I lead the frontend team for Copa Airlines’ booking and payments platform.',
      'The work is the product and the decisions around it: architecture, coding standards, reviews, and technical debt.',
      'I started in quality assurance, automating tests and certifying banking systems, and I still build with that bias.',
      'I work in English and Spanish.',
    ],
    accentColor: accent,
    stringIndex: 1,
  },
  {
    id: 'experience',
    title: 'Experience',
    navLabel: 'Experience',
    note: 'A2',
    shortDescription: 'Six years at EPAM: QA Engineer, then Frontend Developer, now Frontend Tech Lead.',
    accentColor: ink,
    stringIndex: 2,
  },
  {
    id: 'skills',
    title: 'Skills',
    navLabel: 'Skills',
    note: 'E2',
    shortDescription: 'React, Next.js, React Native, and TypeScript.',
    body: 'Frontend, quality, and practice.',
    accentColor: accent,
    stringIndex: 3,
  },
  {
    id: 'projects',
    title: 'Selected Work',
    navLabel: 'Work',
    note: 'G3',
    shortDescription: 'What I have shipped and built.',
    accentColor: muted,
    stringIndex: 4,
  },
  {
    id: 'interests',
    title: 'Off the Clock',
    navLabel: 'Hobby',
    note: 'B3',
    shortDescription: 'Why there is a guitar on my résumé.',
    body: 'I play guitar. It is my hobby, so I built this résumé around one: each string opens a section.\n\nThe page is still a résumé first. Everything works without sound, and you can read it top to bottom without touching a string.',
    accentColor: muted,
    stringIndex: 5,
  },
  {
    id: 'contact',
    title: 'Contact',
    navLabel: 'Contact',
    note: 'E4',
    shortDescription: 'LinkedIn, WhatsApp, GitHub, and Medium.',
    body: 'LinkedIn is the best place for roles and introductions. For a quick message, use WhatsApp.',
    accentColor: accent,
    stringIndex: 6,
  },
];

export function getDefaultSection(): ProfileSection {
  const about = sections.find((section) => section.id === 'about');
  if (!about) {
    throw new Error('Missing about section');
  }
  return about;
}

export function getSectionByStringIndex(stringIndex: number): ProfileSection | undefined {
  return sections.find((section) => section.stringIndex === stringIndex);
}
