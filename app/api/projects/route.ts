import { NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

let projects = [
  {
    id: '1',
    title: 'Fusion - Social Media Platform',
    description: 'A MERN stack social media platform with real-time communication features.',
    image: '/placeholder.svg?height=300&width=400',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Socket.io'],
    github: 'https://github.com/imrithwik1908/fusion',
  },
  // Add more initial projects here
]

export async function GET() {
  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newProject = {
    id: Date.now().toString(),
    ...body,
  }
  projects.push(newProject)
  return NextResponse.json(newProject)
}

