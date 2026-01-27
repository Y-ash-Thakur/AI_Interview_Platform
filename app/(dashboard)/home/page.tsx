import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import InterviewHistory from '@/components/interview/InterviewHistory';
import { Phone, LogOut, User } from 'lucide-react';

export default async function HomePage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const handleSignOut = async () => {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/sign-in');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              AI Interview Platform
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Practice Makes Perfect
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Ace your next interview with AI-powered practice sessions
          </p>
          
          <Link
            href="/interview"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Phone className="w-6 h-6" />
            <span>Start Interview</span>
          </Link>
        </div>

        {/* Interview History */}
        <InterviewHistory />
      </main>
    </div>
  );
}
