export interface Interview {
  id: string;
  user_id: string;
  created_at: string;
  role: string;
  interview_type: 'technical' | 'behavioral' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  current_role?: string;
  num_questions: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  overall_score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  duration_seconds?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  vapi_call_id?: string;
}

export interface InterviewQuestion {
  question: string;
  type: 'technical' | 'behavioral' | 'coding' | 'system_design';
  expectedAnswer: string;
  followUp?: string;
}

export interface InterviewAnswer {
  question: string;
  answer: string;
  duration: number;
  timestamp: number;
}

export interface InterviewEvaluation {
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  questionScores: QuestionScore[];
}

export interface QuestionScore {
  question: string;
  score: number;
  feedback: string;
}

export interface VapiSession {
  callId: string;
  userId?: string;
  role?: string;
  interviewType?: string;
  difficulty?: string;
  currentRole?: string;
  numQuestions?: number;
  questions?: InterviewQuestion[];
  answers?: InterviewAnswer[];
  currentQuestionIndex?: number;
  stage: 'collecting_params' | 'interviewing' | 'completed';
  startTime?: number;
}

export interface Database {
  public: {
    Tables: {
      interviews: {
        Row: Interview;
        Insert: Omit<Interview, 'id' | 'created_at'>;
        Update: Partial<Omit<Interview, 'id' | 'created_at'>>;
      };
    };
  };
}
