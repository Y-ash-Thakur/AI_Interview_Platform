import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    const {
      role,
      interviewType,
      difficulty,
      currentRole,
      numQuestions,
      questions,
      answers,
      overallScore,
      feedback,
      strengths,
      improvements,
      durationSeconds,
      vapiCallId,
    } = body;

    const { data, error } = await supabase
      .from('interviews')
      .insert({
        user_id: user.id,
        role,
        interview_type: interviewType,
        difficulty,
        current_role: currentRole,
        num_questions: numQuestions,
        questions,
        answers,
        overall_score: overallScore,
        feedback,
        strengths,
        improvements,
        duration_seconds: durationSeconds,
        vapi_call_id: vapiCallId,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      interview: data 
    });
  } catch (error: any) {
    console.error('Error saving interview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save interview' },
      { status: 500 }
    );
  }
}
