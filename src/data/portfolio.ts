/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO DATA — the single source of truth for the whole book.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Everything the 3D book prints comes from this file. Edit it freely; no other
 *  file needs to change to update the content of the portfolio.
 *
 *  Anything not supplied by Shereya is marked with `TODO:` and renders as an
 *  obvious, honest placeholder rather than an invented fact.
 */

export type Link = {
  label: string
  href: string
  /** Optional short note printed next to the link. */
  note?: string
}

export type Project = {
  id: string
  title: string
  /** One line of editorial description. */
  tagline: string
  /** The problem it sets out to solve. */
  problem: string
  /** What it does / how it works. */
  description: string
  stack: string[]
  role: string
  links: Link[]
  /** 0 = no live demo supplied. Shown as "Repository" instead. */
  status: 'repository' | 'live'
  /** Optional real screenshot, e.g. "/projects/car-rental.png". */
  image?: string
  /** Muted accent used by the generated preview plate. */
  accent: string
  /** Short monogram printed on the plate. */
  mark: string
}

export type Experiment = {
  id: string
  title: string
  note: string
  stack: string[]
  link?: Link
  accent: string
}

export type SkillGroup = {
  id: string
  title: string
  latin: string
  items: string[]
  note: string
}

export type Chapter = {
  id: string
  number: string
  title: string
  kicker: string
}

/* ── Identity ─────────────────────────────────────────────────────────────── */

export const profile = {
  name: 'Shereya B',
  givenName: 'Shereya',
  initials: 'SB',
  role: 'Aspiring AI & Data Science Engineer',
  disciplines: ['Artificial Intelligence', 'Data Science', 'Software Development'],
  thesis: 'Every Idea Has a Story',
  location: 'Theni, Tamil Nadu, India',
  email: 'shereyabaskaran138@gmail.com',
  /** Printed on the contact page as the closing invitation. */
  invitation:
    'I am always glad to talk about machine learning, honest software, or a problem worth solving. If you have one — or if you would just like to say hello — the next chapter is yours to write.',
  closing: 'The next chapter starts here.',
  availability: 'Open to internships, collaborations and interesting problems',
  /** Used for the About page. */
  about: [
    'Shereya B is a B.Tech student of Artificial Intelligence and Data Science at V.S.B. Engineering College, Karur, where she has held a CGPA of 8.5 since 2022.',
    'Her interest runs across artificial intelligence, machine learning, software development and cybersecurity — and most of all toward technology built for social good. She likes making things that are genuinely useful: applications, interfaces, and small experiments that make a hard problem smaller.',
    'Most of what she knows came from building, breaking and rebuilding — in classrooms, through a ReactJS internship at Infosys Springboard, and in the quiet hours spent reading documentation nobody assigned.',
  ],
  /** Rendered as a marginal annotation on the About page. */
  aboutNote: 'still learning, on purpose',
}

export const socials: Link[] = [
  { label: 'Portfolio', href: 'https://shereya05.github.io/Shereya_Portfolio/', note: 'current site' },
  { label: 'GitHub', href: 'https://github.com/Shereya05', note: '@Shereya05' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/shereya-baskaran-67b379282', note: 'Shereya Baskaran' },
  { label: 'TryHackMe', href: 'https://tryhackme.com/shereyabaskaran1/badges/world-wide-web', note: 'How the Web Works' },
]

/* ── Education, experience, certifications ────────────────────────────────── */

export const education = [
  {
    institution: 'V.S.B. Engineering College',
    place: 'Karur, Tamil Nadu',
    qualification: 'B.Tech — Artificial Intelligence and Data Science',
    period: '2022 – present',
    detail: 'CGPA 8.5',
  },
]

export const experience = [
  {
    role: 'ReactJS Developer Intern',
    org: 'Infosys Springboard',
    period: 'February – April 2025',
    points: [
      'Developed the user interface for a car rental system.',
      'Reported a 40% reduction in booking time.',
      'Reported that 95% of users completed bookings without assistance.',
    ],
    link: { label: 'Infosys', href: 'https://www.infosys.com/' } as Link,
  },
]

export const certifications = [
  {
    title: 'Google Cloud Computing',
    issuer: 'NPTEL',
    detail: 'Elite certificate',
    link: { label: 'NPTEL', href: 'https://nptel.ac.in/' } as Link,
  },
  {
    title: 'How the Web Works',
    issuer: 'TryHackMe',
    detail: 'Learning badge',
    link: {
      label: 'TryHackMe',
      href: 'https://tryhackme.com/shereyabaskaran1/badges/world-wide-web',
    } as Link,
  },
]

/* ── Skills ───────────────────────────────────────────────────────────────── */

export const skillGroups: SkillGroup[] = [
  {
    id: 'programming',
    title: 'Programming',
    latin: 'Linguae',
    items: ['Python', 'Java', 'SQL'],
    note: 'the foundation everything else is built on',
  },
  {
    id: 'web',
    title: 'Web Development',
    latin: 'Inter Rete',
    items: ['ReactJS', 'HTML', 'CSS'],
    note: 'where the internship began',
  },
  {
    id: 'aiml',
    title: 'AI & Machine Learning',
    latin: 'Machina Discentis',
    items: ['CNN', 'K-Means', 'Random Forest', 'Machine Learning'],
    note: 'the part she stays up late for',
  },
  {
    id: 'frameworks',
    title: 'AI Frameworks & Tools',
    latin: 'Instrumenta',
    items: ['LangChain', 'OpenAI API', 'Flask'],
    note: 'from notebook to something people can use',
  },
  {
    id: 'databases',
    title: 'Databases',
    latin: 'Thesauri',
    items: ['MySQL'],
    note: 'structured, queryable, honest',
  },
  {
    id: 'tools',
    title: 'Tools & Platforms',
    latin: 'Officina',
    items: ['Git', 'GitHub', 'VS Code', 'Jupyter', 'Notion', 'TryHackMe'],
    note: 'the everyday workbench',
  },
  {
    id: 'soft',
    title: 'Ways of Working',
    latin: 'Modus',
    items: ['Teamwork', 'Leadership', 'Communication'],
    note: 'learned by shipping with other people',
  },
]

/* ── Projects ─────────────────────────────────────────────────────────────── */

export const projects: Project[] = [
  {
    id: 'car-rental',
    title: 'Car Rental System',
    tagline: 'Book a car in fewer steps than it takes to read this caption.',
    problem:
      'Booking a rental car usually means phone calls, guesswork about availability, and no record of what you booked. This system puts the whole journey in one place.',
    description:
      'A car rental application with authentication, live vehicle availability, booking, booking history and an administration view for managing the fleet and the reservations.',
    stack: ['React', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB'],
    role: 'Built the user interface end to end during the Infosys Springboard internship — screens, state, routing and the booking flow.',
    links: [{ label: 'GitHub', href: 'https://github.com/Shereya05/Carrentalsystem', note: 'repository' }],
    status: 'repository',
    accent: '#7a4a3a',
    mark: 'CR',
  },
  {
    id: 'hostel-complaint',
    title: 'Hostel Complaint Tracker',
    tagline: 'A complaint that nobody loses.',
    problem:
      'Hostel complaints die in WhatsApp groups. Students never learn whether anything happened, and administrators never get a clean picture of what is outstanding.',
    description:
      'A complaint management application with separate student and administrator views — students lodge and follow complaints, administrators triage, assign and close them.',
    stack: ['HTML', 'CSS', 'PHP', 'MySQL'],
    role: 'Designed the database schema and built both the student and the administrator interfaces.',
    links: [
      { label: 'GitHub', href: 'https://github.com/Shereya05/hostel-complaint-tracker', note: 'repository' },
    ],
    status: 'repository',
    accent: '#4a5a52',
    mark: 'HC',
  },
  {
    id: 'ipl-prediction',
    title: 'IPL Score Prediction',
    tagline: 'Reading the innings before it is written.',
    problem:
      'A cricket score is a running argument between momentum, wickets and overs remaining. This project turns that argument into a number.',
    description:
      'A machine-learning and data-science project that explores historical match data, engineers the features that actually carry signal, and predicts a final innings score.',
    stack: ['Python', 'Pandas', 'Scikit-learn', 'Jupyter'],
    role: 'Data preparation, feature engineering, model training and evaluation.',
    links: [
      { label: 'GitHub', href: 'https://github.com/Shereya05/IPL_Score_Prediction', note: 'repository' },
    ],
    status: 'repository',
    accent: '#3f4a6b',
    mark: 'IP',
  },
  {
    id: 'qr-resume',
    title: 'QR Code Generator — Resume',
    tagline: 'A résumé that is one scan away.',
    problem:
      'Paper résumés cannot be updated, and links on them cannot be clicked. A QR code bridges the paper and the living version of the same document.',
    description:
      'A Python utility that generates a QR code pointing at a résumé, ready to be printed on a business card or a physical copy of the CV.',
    stack: ['Python'],
    role: 'Wrote the generator and the output handling.',
    links: [
      { label: 'GitHub', href: 'https://github.com/Shereya05/QR_code_generator_resume', note: 'repository' },
    ],
    status: 'repository',
    accent: '#5c4a2e',
    mark: 'QR',
  },
]

/* ── Experiments ──────────────────────────────────────────────────────────── */

export const experiments: Experiment[] = [
  {
    id: 'deepfake',
    title: 'Deepfake Detection System',
    note: 'A CNN trained to separate manipulated media from real media, reported at 96% accuracy and deployed behind a Flask interface so that it could actually be used, not just measured.',
    stack: ['Python', 'CNN', 'Flask'],
    link: { label: 'Repositories', href: 'https://github.com/Shereya05?tab=repositories' },
    accent: '#4b3550',
  },
  {
    id: 'rag-chatbot',
    title: 'RAG Chatbot',
    note: 'A retrieval-augmented generation chatbot built on LangChain and the OpenAI API — the experiment behind understanding how far a model can be trusted when it is given somewhere to look.',
    stack: ['LangChain', 'OpenAI API', 'Python'],
    link: { label: 'Repositories', href: 'https://github.com/Shereya05?tab=repositories' },
    accent: '#2f4a4a',
  },
  {
    id: 'behaviour',
    title: 'User Behaviour Analysis',
    note: 'Segmented user behaviour with K-Means clustering and classified it with a Random Forest — a seven-day sprint that ended up being the project that taught the most about evaluation.',
    stack: ['K-Means', 'Random Forest', 'Python'],
    link: { label: 'Repositories', href: 'https://github.com/Shereya05?tab=repositories' },
    accent: '#4a3b2a',
  },
]

/* ── Learning timeline ────────────────────────────────────────────────────── */

export type Milestone = {
  /** Shown in the left column of the timeline. Real dates only. */
  when: string
  title: string
  detail: string
  kind: 'education' | 'work' | 'learning'
}

export const journey: Milestone[] = [
  {
    when: '2022',
    title: 'B.Tech begins',
    detail:
      'Artificial Intelligence and Data Science at V.S.B. Engineering College, Karur. The first real encounter with programming, mathematics and the long habit of not understanding something yet.',
    kind: 'education',
  },
  {
    when: '2022 —',
    title: 'Building in public',
    detail:
      'Coursework turns into side projects: a hostel complaint tracker, a QR code generator for résumés, an IPL score prediction notebook. Learning by shipping small things.',
    kind: 'learning',
  },
  {
    when: 'Feb — Apr 2025',
    title: 'ReactJS Developer Intern',
    detail:
      'Infosys Springboard. Built the interface for a car rental system; the booking flow was reported to cut booking time by 40%, with 95% of users completing a booking unassisted.',
    kind: 'work',
  },
  {
    when: '2025 —',
    title: 'Applied AI',
    detail:
      'Deepfake detection with CNNs, a retrieval-augmented chatbot on LangChain and the OpenAI API, and user behaviour analysis with K-Means and Random Forest. From notebooks toward deployable work.',
    kind: 'learning',
  },
  {
    when: 'Along the way',
    title: 'Cybersecurity, quietly',
    detail:
      'Google Cloud Computing through NPTEL (Elite certificate) and the TryHackMe "How the Web Works" badge — because knowing how software breaks makes it better software.',
    kind: 'learning',
  },
]

export const interests = [
  { title: 'Artificial Intelligence', note: 'Models that earn their confidence.' },
  { title: 'Machine Learning', note: 'Features, evaluation, and the honesty of a held-out set.' },
  { title: 'Data Science', note: 'Turning a messy table into an argument.' },
  { title: 'Cybersecurity', note: 'How the web really works — and how it fails.' },
  { title: 'Software Development', note: 'Interfaces people do not have to be taught.' },
  { title: 'Technology for Social Good', note: 'The projects worth the time.' },
]

/* ── The eight chapters of the book ───────────────────────────────────────── */

export const chapters: Chapter[] = [
  { id: 'cover', number: 'i', title: 'Cover', kicker: 'Every Idea Has a Story' },
  { id: 'about', number: '01', title: 'About Me', kicker: 'The short version' },
  { id: 'skills', number: '02', title: 'Skills', kicker: 'What she builds with' },
  { id: 'projects', number: '03', title: 'Selected Projects', kicker: 'Four things that work' },
  { id: 'journey', number: '04', title: 'The Journey', kicker: 'A timeline, in ink' },
  { id: 'universe', number: '05', title: 'Creative Universe', kicker: 'What pulls her in' },
  { id: 'experiments', number: '06', title: 'Experiments & Ideas', kicker: 'A working notebook' },
  { id: 'contact', number: '07', title: 'Contact', kicker: 'The next chapter starts here' },
]

/** Total number of physical leaves = one per chapter. */
export const LEAF_COUNT = chapters.length

/** Pre-filled mailto used by the contact page action. */
export const mailtoHref = `mailto:${profile.email}?subject=${encodeURIComponent(
  'Hello Shereya — let’s build something',
)}&body=${encodeURIComponent(
  'Hi Shereya,\n\nI found your portfolio and wanted to reach out about ',
)}`
