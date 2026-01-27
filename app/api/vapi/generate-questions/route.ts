import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/lib/gemini/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { role, interviewType, difficulty, currentRole, numQuestions } = body;

    // Validate input
    if (!role || !interviewType || !difficulty || !numQuestions) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate questions using Gemini
    const questions = await generateInterviewQuestions({
      role,
      interviewType,
      difficulty,
      currentRole,
      numQuestions: parseInt(numQuestions),
    });

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Error in generate-questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
