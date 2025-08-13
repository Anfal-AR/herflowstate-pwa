// src/app/offline/page.tsx
'use client';

import type { Metadata, Viewport } from 'next';


export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <svg 
            className="w-20 h-20 mx-auto text-pink-500 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" 
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            You&apos;re Offline
          </h1>
          <p className="text-gray-600 mb-6">
            Don&apos;t worry! HerFlowState works offline too. Check your connection to sync your latest changes.
          </p>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <button 
            onClick={() => window.history.back()} 
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>You can still use many features while offline!</p>
        </div>
      </div>
    </div>
  );
}