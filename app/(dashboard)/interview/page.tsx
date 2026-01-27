import VoiceInterface from '@/components/interview/VoiceInterface';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function InterviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/home"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Practice Interview
          </h1>
          <p className="text-gray-600">
            Click the call button to start your AI-powered interview practice session
          </p>
        </div>

        {/* Voice Interface */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <VoiceInterface />
        </div>

        {/* Tips */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Interview Tips
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Find a quiet environment with good internet connection</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Speak clearly and at a moderate pace</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Take your time to think before answering</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Use specific examples when possible</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>The AI will provide detailed feedback after completion</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
