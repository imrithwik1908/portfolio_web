import { NextResponse } from 'next/server'
import { projects } from '@/lib/portfolio-data'


export async function GET() {
  return NextResponse.json(projects)
}

export async function POST() {
  return NextResponse.json({ error: 'Project data is read-only.' }, { status: 405 })
}
