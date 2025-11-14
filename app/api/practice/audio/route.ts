import { NextResponse } from 'next/server';
import practiceAudio from '@/data/practice-audio.json';

export async function GET() {
  return NextResponse.json(practiceAudio);
}
