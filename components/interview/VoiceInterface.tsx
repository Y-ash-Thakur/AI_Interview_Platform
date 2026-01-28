'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import Vapi from '@vapi-ai/web';

export default function VoiceInterface() {
  const [sdkLoaded, setSdkLoaded] = useState(true); // SDK is always loaded when component mounts (via npm import)
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('Ready to start');
  const [transcript, setTranscript] = useState<string[]>([]);
  const vapiInstance = useRef<Vapi | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiInstance.current) {
        vapiInstance.current.stop();
      }
    };
  }, []);

  const startCall = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
        throw new Error('Vapi public key is not configured');
      }

      // 🔹 Create Vapi instance using npm package
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

      vapiInstance.current = vapi;

      // 🔹 Event listeners
      vapi.on('call-start', () => {
        console.log('Call started');
        setIsCallActive(true);
        setCallStatus('Call in progress...');
      });

      vapi.on('call-end', () => {
        console.log('Call ended');
        setIsCallActive(false);
        setCallStatus('Call ended');
      });

      vapi.on('speech-start', () => {
        setCallStatus('Listening...');
      });

      vapi.on('speech-end', () => {
        setCallStatus('Processing...');
      });

      vapi.on('message', (message: any) => {
        console.log('Message:', message);

        if (message.type === 'transcript' && message.transcript) {
          setTranscript(prev => [...prev, `${message.role}: ${message.transcript}`]);
        }
      });

      vapi.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setCallStatus('Error: ' + error.message);
      });

      // 🔹 IMPORTANT: Use ASSISTANT ID (from Vapi Dashboard)
      vapi.start("e3b80a62-c5fb-480e-ace4-0b03fa51b2cf"); // 🔴 YOUR ASSISTANT ID

    } catch (error: any) {
      console.error('Error starting call:', error);
      setCallStatus('Failed to start call: ' + error.message);
    }
  };

  const endCall = () => {
    if (vapiInstance.current) {
      vapiInstance.current.stop();
      setIsCallActive(false);
      setCallStatus('Call ended');
    }
  };

  const toggleMute = () => {
    if (vapiInstance.current) {
      vapiInstance.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
      {/* Status */}
      <div className="text-center">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
          isCallActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="font-medium">{callStatus}</span>
        </div>
      </div>

      {/* Call Button */}
      <div className="relative">
        <button
          onClick={isCallActive ? endCall : startCall}
          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
            isCallActive
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50'
          }`}
        >
          {isCallActive ? (
            <PhoneOff className="w-10 h-10 text-white" />
          ) : (
            <Phone className="w-10 h-10 text-white" />
          )}
        </button>

        {isCallActive && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-gray-700 hover:bg-gray-800'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-white" />
              ) : (
                <Mic className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {isCallActive ? 'Interview in Progress' : 'Ready to Start'}
        </h3>
        <p className="text-gray-600">
          {isCallActive
            ? 'Answer the questions clearly and take your time. Click the phone icon to end the interview.'
            : 'Click the phone button to start your AI-powered practice interview session.'}
        </p>
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="w-full max-w-2xl mt-8 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <h4 className="font-semibold text-gray-800 mb-2">Transcript:</h4>
          <div className="space-y-2">
            {transcript.map((line, idx) => (
              <p key={idx} className="text-sm text-gray-700">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
