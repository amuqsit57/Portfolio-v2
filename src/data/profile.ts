// Single source of truth for everything the mainboard displays.
// Edit this file to update the portfolio — no scene code needs to change.

export const profile = {
  name: "Abdul Muqsit",
  role: "Software Engineer",
  focus: "Web & Mobile · Full Stack",
  location: "Islamabad, Pakistan",
  email: "Amuqsit57@gmail.com",
  // TODO: replace with your real profile URLs
  links: {
    linkedin: "https://www.linkedin.com/in/",
    github: "https://github.com/",
  },
  bio: [
    "Full-stack software engineer with 4+ years building production web and mobile products across Next.js, React, React Native, NestJS, GraphQL, Node.js and Python.",
    "I care about interfaces that feel alive and backends that stay calm under load: CI/CD pipelines, Git workflows, Docker and cloud deployments are part of how I ship.",
    "Lately I've been going deep on AI/ML, putting multimodal models, pose detection and generative pipelines into apps people actually use.",
  ],
  stats: [
    { label: "UPTIME", value: "4+", unit: "YRS", load: 0.82 },
    { label: "THREADS", value: "18", unit: "PROJECTS", load: 0.9 },
    { label: "CLIENTS", value: "15+", unit: "SHIPPED", load: 0.74 },
    { label: "PEAK LOAD", value: "3K+", unit: "CONCURRENT", load: 0.97 },
    { label: "CGPA", value: "3.91", unit: "MEDALIST", load: 0.98 },
    { label: "RATING", value: "5.0", unit: "UPWORK", load: 1 },
  ],
  skillTree: [
    {
      branch: "Frontend",
      skills: [
        { name: "Next.js", load: 0.96 },
        { name: "React", load: 0.97 },
        { name: "JavaScript / TS", load: 0.93 },
        { name: "HTML / CSS", load: 0.9 },
        { name: "Responsive Design", load: 0.9 },
      ],
    },
    {
      branch: "Mobile",
      skills: [
        { name: "React Native", load: 0.94 },
        { name: "Expo", load: 0.86 },
        { name: "Android · Java", load: 0.78 },
      ],
    },
    {
      branch: "Backend",
      skills: [
        { name: "Node.js", load: 0.92 },
        { name: "NestJS", load: 0.9 },
        { name: "GraphQL", load: 0.88 },
        { name: "Express", load: 0.87 },
        { name: "FastAPI · Python", load: 0.8 },
      ],
    },
    {
      branch: "Data",
      skills: [
        { name: "MongoDB", load: 0.88 },
        { name: "PostgreSQL · RLS", load: 0.84 },
      ],
    },
    {
      branch: "DevOps",
      skills: [
        { name: "Git · CI/CD", load: 0.88 },
        { name: "Docker", load: 0.8 },
        { name: "GCP Cloud Run", load: 0.76 },
        { name: "AWS · K8s · Jenkins", load: 0.66 },
      ],
    },
    {
      branch: "AI / ML",
      skills: [
        { name: "Gemini · Multimodal", load: 0.82 },
        { name: "MediaPipe · Pose", load: 0.78 },
        { name: "Playwright Automation", load: 0.84 },
        { name: "GenAI Pipelines", load: 0.8 },
      ],
    },
  ],
};

export type Experience = {
  company: string;
  role: string;
  mode: string;
  period: string;
  color: string;
  stack: string[];
  points: string[];
};

// Each job is a memory module in the DIMM bank.
export const experience: Experience[] = [
  {
    company: "CCRIPT Agency",
    role: "Software Engineer",
    mode: "Remote",
    period: "Sep 2025 – Present",
    color: "#35f0ff",
    stack: ["MongoDB", "Express", "React", "Node.js", "Docker", "CI/CD"],
    points: [
      "Designing, building and optimizing scalable software that drives client success and digital transformation.",
      "Full-stack MERN applications focused on performance, scalability and maintainability.",
      "Integrating APIs, automation tools and performance monitoring for production-grade deployments.",
      "Cross-functional work on UI/UX, microservice integrations and continuous delivery.",
      "DevOps: CI/CD pipelines, Docker and cloud deployments for seamless releases.",
    ],
  },
  {
    company: "Neuralogic",
    role: "Full Stack Developer",
    mode: "Remote",
    period: "Sep 2025 – Present",
    color: "#8f7bff",
    stack: ["React", "Next.js", "NestJS", "GraphQL", "PostgreSQL", "MongoDB"],
    points: [
      "Full-stack apps on React, Next.js, Node.js and NestJS with high performance and scalability.",
      "Architecting modular solutions with product teams and integrating AI-powered automation and analytics.",
      "Building GraphQL microservices to improve API efficiency and backend modularity.",
      "Query optimization and schema design across MongoDB and PostgreSQL.",
      "Keeping UI consistent and code quality high through Git workflows and peer review.",
    ],
  },
  {
    company: "Life Replay",
    role: "Product Engineer",
    mode: "Self-employed",
    period: "Jul 2026 – Sep 2026",
    color: "#ff5fa2",
    stack: ["React Native", "Expo", "FastAPI", "Cloud Run", "FFmpeg", "Gemini"],
    points: [
      "Shipped an AI video product end-to-end: React Native/Expo app, FastAPI, Cloud Run and serverless FFmpeg rendering.",
      "Designed an AI architecture that generates editable films as shot documents, so every edit stays re-cuttable.",
      "Multimodal video understanding with Gemini and original scoring with Lyria; keyframe sampling to cut inference cost.",
      "Invite-code sharing, PostgreSQL Row-Level Security and RevenueCat subscriptions with server-verified entitlements.",
      "Production infra from scratch: secrets management, IAM-based signing, serverless render pipelines, Android builds.",
    ],
  },
  {
    company: "AdvertiseAi",
    role: "Founder",
    mode: "Remote",
    period: "Feb 2025 – Sep 2025",
    color: "#ffb13b",
    stack: ["GenAI", "ML", "Next.js", "Automation"],
    points: [
      "Founded AdvertiseAi, an AI-powered ad creative generator.",
      "Built the platform from scratch, combining AI, ML and web automation to generate ad copy, visuals and ROAS predictions.",
      "Owned the full lifecycle: concept, architecture, backend infrastructure, front-end design and deployment.",
    ],
  },
  {
    company: "Hexler Tech",
    role: "Full Stack Mobile Developer",
    mode: "Onsite",
    period: "Apr 2025 – Jun 2025",
    color: "#4dff9d",
    stack: ["React Native", "Java", "NestJS", "GraphQL", "Microservices"],
    points: [
      "Cross-platform apps in React Native and native Android (Java) for 15+ clients.",
      "Scalable NestJS + GraphQL services in a microservices architecture.",
      "Built and integrated RESTful APIs and backend services.",
      "Intuitive, responsive UI components tailored for mobile.",
    ],
  },
  {
    company: "Emumba Pvt. Ltd.",
    role: "Full Stack Web Developer Intern",
    mode: "Onsite",
    period: "Jun 2024 – Aug 2024",
    color: "#3b9bff",
    stack: ["React", "Node.js", "Express", "MongoDB", "PostgreSQL"],
    points: [
      "Full-stack web apps with React, Node.js and Express with a focus on performance and responsiveness.",
      "Designed, built and integrated RESTful APIs between front end and back end.",
      "CRUD and query optimization on MongoDB and PostgreSQL to speed up data retrieval.",
    ],
  },
  {
    company: "Recapeo Pvt. Ltd.",
    role: "Front End Developer Intern",
    mode: "Remote",
    period: "Dec 2023 – Feb 2024",
    color: "#ff7a45",
    stack: ["React", "JavaScript", "HTML5", "CSS3", "Git"],
    points: [
      "Responsive, dynamic interfaces with HTML5, CSS3 and JavaScript.",
      "Built and maintained front-end components in React.",
      "Version control with Git and GitHub.",
    ],
  },
  {
    company: "Upwork",
    role: "Freelance Developer",
    mode: "Remote",
    period: "Jun 2022 – Jul 2025",
    color: "#c6ff3d",
    stack: ["React", "Next.js", "Node.js", "React Native", "Cloud"],
    points: [
      "Custom full-stack web and mobile solutions for international clients.",
      "Dashboards, e-commerce sites and mobile tools on React, Next.js and Node.js.",
      "Consistent 5-star feedback for communication, technical skill and on-time delivery.",
      "End-to-end ownership: requirements, technical design, development, deployment and maintenance.",
    ],
  },
];

export type ProjectKind = "mobile" | "web" | "ai" | "backend" | "automation";

export type Project = {
  name: string;
  tagline: string;
  kind: ProjectKind;
  color: string;
  stack: string[];
  summary: string;
  highlights: string[];
  metric?: { value: string; label: string };
};

// Featured projects: one per PCIe expansion card.
export const featured: Project[] = [
  {
    name: "Life Replay",
    tagline: "AI collaborative video editing",
    kind: "mobile",
    color: "#ff5fa2",
    stack: ["React Native", "Expo", "FastAPI", "Cloud Run", "FFmpeg", "Gemini", "Lyria", "PostgreSQL"],
    summary:
      "An end-to-end AI video platform: a React Native/Expo app backed by FastAPI microservices and serverless FFmpeg rendering on Cloud Run.",
    highlights: [
      "Multimodal understanding with Gemini keyframe sampling",
      "Original event scoring generated with Lyria",
      "Films stored as shot documents, fully re-cuttable",
      "PostgreSQL RLS + RevenueCat server-verified entitlements",
    ],
    metric: { value: "E2E", label: "shipped solo" },
  },
  {
    name: "IvoteLive.com",
    tagline: "High-concurrency voting platform",
    kind: "web",
    color: "#35f0ff",
    stack: ["Python", "FastAPI", "React", "Realtime"],
    summary:
      "Optimized and scaled a real-time voting platform to handle 3,000+ concurrent users without breaking a sweat.",
    highlights: [
      "Re-engineered FastAPI endpoints for throughput",
      "Optimized front-end rendering pipelines",
      "Eliminated concurrency bottlenecks and cut latency",
    ],
    metric: { value: "3,000+", label: "concurrent users" },
  },
  {
    name: "AdvertiseAi",
    tagline: "GenAI ad creative engine",
    kind: "ai",
    color: "#ffb13b",
    stack: ["GenAI", "ML", "Next.js", "Node.js", "Automation"],
    summary:
      "A generative AI tool that turns product info into high-performing ad creatives, with copy, visuals and ROAS predictions.",
    highlights: [
      "Founded and built from zero to product",
      "Copy + visual generation in one pipeline",
      "Predictive ROAS scoring for each creative",
    ],
    metric: { value: "0→1", label: "founder build" },
  },
  {
    name: "HIPAA Verify",
    tagline: "Insurance verification automation",
    kind: "automation",
    color: "#4dff9d",
    stack: ["Playwright", "Node.js", "Next.js", "Security"],
    summary:
      "A secure, HIPAA-compliant automation system that streamlines patient insurance eligibility checks under strict privacy rules.",
    highlights: [
      "Headless Playwright verification flows",
      "Next.js operator dashboard",
      "Privacy and compliance built into every step",
    ],
    metric: { value: "HIPAA", label: "compliant" },
  },
  {
    name: "Super App",
    tagline: "HR · Payroll · Chat in one",
    kind: "backend",
    color: "#8f7bff",
    stack: ["NestJS", "GraphQL", "Microservices", "Realtime"],
    summary:
      "Backend of a unified enterprise app on NestJS, GraphQL and microservices, combining payroll, HR tools and real-time messaging.",
    highlights: [
      "Modular microservice architecture",
      "Payroll processing engine",
      "Real-time messaging over GraphQL",
    ],
    metric: { value: "3-in-1", label: "enterprise suite" },
  },
  {
    name: "Cricket Posture AI",
    tagline: "Real-time batting pose analysis",
    kind: "ai",
    color: "#3b9bff",
    stack: ["React Native", "Java", "MediaPipe", "Python", "NumPy"],
    summary:
      "A mobile app that detects batting posture in real time through the camera and reports how far a player deviates from standard stances. Includes a shot-classification model built on MediaPipe.",
    highlights: [
      "Live pose detection through the phone camera",
      "Deviation scoring against standard batting positions",
      "Shot classification and angle analysis model",
    ],
    metric: { value: "Live", label: "pose inference" },
  },
];

export type ArchiveItem = { name: string; stack: string[]; summary: string; kind: ProjectKind };

// Everything else lives on the NVMe "archive" drive.
export const archive: ArchiveItem[] = [
  {
    name: "Rohrman Automotive",
    kind: "automation",
    stack: ["Pipelines", "Tekion", "Finance"],
    summary: "Automated dealership merchandising and Tekion portal integrations for Purchase Orders and Journal Entries.",
  },
  {
    name: "AI Estimation & HRA Canvas",
    kind: "ai",
    stack: ["AI", "Canvas", "HITL", "CV"],
    summary: "AI estimation systems and Health Risk Assessment workflows with a canvas-based human-in-the-loop validation UI.",
  },
  {
    name: "Smart Media Cleaner",
    kind: "mobile",
    stack: ["React Native", "NestJS", "GraphQL"],
    summary: "Swipe-to-clean app (left delete, right keep) with hash- and metadata-based duplicate detection.",
  },
  {
    name: "Food Ordering App",
    kind: "mobile",
    stack: ["React Native", "Stripe", "NestJS", "GraphQL"],
    summary: "Cross-platform ordering with Stripe payments and a real-time NestJS + GraphQL backend.",
  },
  {
    name: "Cricket Shot Classifier",
    kind: "ai",
    stack: ["MediaPipe", "NumPy", "Matplotlib"],
    summary: "ML model classifying cricket shots and analysing batting angles from a batting dataset.",
  },
  {
    name: "Automated Deployment Pipeline",
    kind: "backend",
    stack: ["Jenkins", "Selenium", "Docker", "AWS", "Kubernetes"],
    summary: "Fully automated CI/CD with Selenium tests, Dockerized AWS environments and Kubernetes auto-scaling.",
  },
  {
    name: "Zoom Admin Panel",
    kind: "web",
    stack: ["React", "Node.js", "Express", "Zoom API"],
    summary: "Responsive admin panel to schedule, manage and track Zoom meetings, users and reports.",
  },
  {
    name: "Tattoo Studio Portal",
    kind: "web",
    stack: ["React"],
    summary: "Customer portal to explore tattoo designs and book appointments with artists.",
  },
  {
    name: "Wedding Décor Admin",
    kind: "web",
    stack: ["PHP"],
    summary: "Admin panel managing bookings, inventory, décor packages and client inquiries.",
  },
  {
    name: "Web Game Rescue",
    kind: "web",
    stack: ["HTML", "CSS", "JS", "Database"],
    summary: "Fixed a web game's functionality and performance and migrated its database to a scalable solution.",
  },
  {
    name: "Budgeter",
    kind: "mobile",
    stack: ["Android", "Java"],
    summary: "Budget management Android app, delivered as project lead.",
  },
  {
    name: "Eye Saver",
    kind: "mobile",
    stack: ["Android", "Java"],
    summary: "20-minute screen-break reminders to protect eye health.",
  },
];

export const education = {
  school: "COMSATS University",
  location: "Islamabad, Pakistan",
  degree: "Bachelor of Science in Computer Science (BSCS)",
  period: "2021 – 2025",
  cgpa: "3.91",
  honor: "Medalist",
};
