'use client'

import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Navigation from './Navigation'

interface ComingSoonProps {
  title: string
  description: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We&apos;re working hard to bring you this amazing feature. Stay tuned for updates!
          </p>
          <Link href="/" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <Navigation />
    </div>
  )
}