import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions, evaluateInterview } from '@/lib/gemini/client';
import { createClient } from '@/lib/supabase/server';

interface VapiMessage {
  type: string;
  call?: {
    id: string;
    status: string;
  };
  message?: {
    role: string;
    content: string;
  };
  transcript?: string;
  [key: string]: any;
}

// Store interview sessions in memory (in production, use Redis or database)
const interviewSessions = new Map<string, {
  userId?: string;
  callId: string;
  role?: string;
  interviewType?: string;
  difficulty?: string;
  currentRole?: string;
  numQuestions?: number;
  questions?: any[];
  answers?: any[];
  currentQuestionIndex?: number;
  stage: 'collecting_params' | 'interviewing' | 'completed';
  startTime?: number;
}>();

export async function POST(req: NextRequest) {
  try {
    const body: VapiMessage = await req.json();
    
    console.log('Vapi webhook received:', body.type);

    const callId = body.call?.id || body.callId;

    if (!callId) {
      return NextResponse.json({ error: 'No call ID' }, { status: 400 });
    }

    // Initialize session if it doesn't exist
    if (!interviewSessions.has(callId)) {
      interviewSessions.set(callId, {
        callId,
        stage: 'collecting_params',
        answers: [],
        startTime: Date.now(),
      });
    }

    const session = interviewSessions.get(callId)!;

    // Handle different webhook events
    switch (body.type) {
      case 'function-call':
        return handleFunctionCall(body, session);
      
      case 'transcript':
        return handleTranscript(body, session);
      
      case 'end-of-call-report':
        return handleEndOfCall(body, session);
      
      default:
        return NextResponse.json({ received: true });
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleFunctionCall(body: any, session: any) {
  const functionName = body.functionCall?.name;
  const parameters = body.functionCall?.parameters;

  if (functionName === 'generate_questions') {
    // Save parameters to session
    session.role = parameters.role;
    session.interviewType = parameters.interviewType;
    session.difficulty = parameters.difficulty;
    session.currentRole = parameters.currentRole;
    session.numQuestions = parameters.numQuestions;

    // Generate questions
    const questions = await generateInterviewQuestions({
      role: parameters.role,
      interviewType: parameters.interviewType,
      difficulty: parameters.difficulty,
      currentRole: parameters.currentRole,
      numQuestions: parseInt(parameters.numQuestions),
    });

    session.questions = questions;
    session.currentQuestionIndex = 0;
    session.stage = 'interviewing';

    return NextResponse.json({
      result: {
        questions,
        message: `Great! I've prepared ${questions.length} questions for your ${parameters.role} interview. Let's begin with the first question.`,
      },
    });
  }

  if (functionName === 'record_answer') {
    const { questionIndex, answer } = parameters;
    
    if (session.questions && session.questions[questionIndex]) {
      session.answers!.push({
        question: session.questions[questionIndex].question,
        answer,
        duration: 0,
        timestamp: Date.now(),
      });

      session.currentQuestionIndex = questionIndex + 1;

      // Check if interview is complete
      if (session.currentQuestionIndex >= session.questions.length) {
        session.stage = 'completed';
        
        // Generate evaluation
        const evaluation = await evaluateInterview({
          role: session.role!,
          questions: session.questions,
          answers: session.answers!,
        });

        return NextResponse.json({
          result: {
            message: 'Interview complete! Generating your feedback...',
            evaluation,
            completed: true,
          },
        });
      }

      return NextResponse.json({
        result: {
          message: 'Answer recorded. Moving to next question.',
          nextQuestionIndex: session.currentQuestionIndex,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleTranscript(body: any, session: any) {
  console.log('Transcript:', body.transcript);
  return NextResponse.json({ received: true });
}

async function handleEndOfCall(body: any, session: any) {
  console.log('Call ended:', body);
  
  // Clean up session after some time
  setTimeout(() => {
    interviewSessions.delete(session.callId);
  }, 300000); // 5 minutes

  return NextResponse.json({ received: true });
}
