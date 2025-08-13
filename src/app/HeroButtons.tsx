// src/app/HeroButtons.tsx
'use client';

import Link from 'next/link';
import { Target, ArrowRight, Sparkles } from 'lucide-react';

export default function HeroButtons() {
  return (
    <>
      <Link
        href="/tracker/goals"
        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                   text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
      >
        <Target className="mr-2" size={20} />
        Start Goal Tracking
        <Sparkles className="ml-2" size={16} />
      </Link>
      
      <Link
        href="#features"
        className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-200 
                   text-purple-600 font-medium rounded-xl hover:bg-purple-50 transition-all"
      >
        Explore Features
        <ArrowRight className="ml-2" size={16} />
      </Link>
    </>
  );
}