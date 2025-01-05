import { NextResponse } from 'next/server';

const projects = [
  {
    id: '1',
    title: 'Fusion - Social Media Platform',
    description: 'A MERN stack social media platform with real-time communication features.',
    image: '/placeholder.svg?height=300&width=400',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Socket.io'],
    github: 'https://github.com/imrithwik1908/fusion',
  },
  // Add more initial projects here
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
