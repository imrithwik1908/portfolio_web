import { NextResponse } from 'next/server';

const projects = [
  {
    id: '1',
    title: 'AgentGuard',
    context: 'Independent project',
    category: 'ai-ml',
    description: 'AgentGuard tracks regressions in LLM applications. A Python SDK records traces and nested steps; FastAPI, PostgreSQL, and a background worker store and evaluate runs; the Next.js interface compares a baseline with a candidate. An LLM judge can contribute an evaluation, but deterministic rules make the final pass, block, or review decision. The current v1 is working and deployed, with known limitations documented in the repository.',
    image: '/agentguard.png',
    tags: ['FastAPI', 'PostgreSQL', 'Redis', 'Next.js', 'Python SDK', 'LLM evaluation'],
    github: 'https://github.com/imrithwik1908/AgentGuard',
    live: 'https://agentguard-platform.vercel.app',
  },
  {
    id: '2',
    title: 'Fusion Chat',
    context: 'Personal project',
    category: 'full-stack',
    description: 'A MERN social application built around accounts, profiles, following, groups, and direct chat. Socket.IO carries live messages and online status, while MongoDB stores users, relationships, groups, and chat history.',
    image: '/fusion.png',
    tags: ['Node.js', 'Express', 'MongoDB', 'Socket.IO', 'EJS'],
    github: 'https://github.com/imrithwik1908/FUSION_CHAT',
  },
  {
    id: '3',
    title: 'Tensor Fusion - Multimodal Sentiment Analysis',
    context: 'Research project',
    category: 'ai-ml',
    description: 'A set of experiments on multimodal sentiment analysis for review videos. The notebooks compare ways of combining language, visual, and acoustic features across classification and regression setups, including how each modality and fusion choice affects the result.',
    image: '/tensor_fusion.jpg',
    tags: ['Python', 'TensorFlow', 'NLP', 'Computer Vision', 'Audio'],
    github: 'https://github.com/imrithwik1908/Tensor-Fusion-Network',
  },
  {
    id: '4',
    title: 'Strava API Wrapper',
    context: 'Academic project',
    category: 'backend-api',
    description: 'A Flask wrapper around Strava\'s OAuth and athlete APIs. It handles authorization, token exchange and refresh, fetches profile and activity data, and includes a small dashboard for filtering activities by date.',
    image: '/custom_api.png',
    tags: ['Python', 'Flask', 'OAuth', 'Strava API'],
    github: 'https://github.com/imrithwik1908/Mini-Project---6th-Sem',
  },
  {
    id: '5',
    title: 'Course Catalog',
    context: 'Academic team project',
    category: 'database',
    description: 'A role-based course system with Google authentication and separate student and professor flows. Students can browse and enroll in courses; professors manage their own course records. MongoDB stores courses, people, and enrollment relationships.',
    image: '/course_catalog.jpg',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'EJS', 'Google OAuth'],
    github: 'https://github.com/imrithwik1908/course_catalog',
  },
];


export async function GET() {
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProject = {
      id: Date.now().toString(),
      ...body,
    };
    projects.push(newProject);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
