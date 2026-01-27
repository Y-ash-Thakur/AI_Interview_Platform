'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, TrendingUp, Award, ChevronRight } from 'lucide-react';

interface Interview {
  id: string;
  created_at: string;
  role: string;
  interview_type: string;
  difficulty: string;
  num_questions: number;
  overall_score: number;
  duration_seconds: number;
  status: string;
}

export default function InterviewHistory() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setInterviews(data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700',
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg">
        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No interviews yet
        </h3>
        <p className="text-gray-600">
          Start your first practice interview to see your history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Recent Interviews
      </h2>
      
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {interview.role}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(interview.difficulty)}`}>
                  {interview.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {interview.interview_type}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDistanceToNow(new Date(interview.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {Math.floor(interview.duration_seconds / 60)} minutes
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {interview.num_questions} questions
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getScoreColor(interview.overall_score)}`}>
                {interview.overall_score}%
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
