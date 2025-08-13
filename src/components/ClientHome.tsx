'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import DashboardCard from '@/components/DashboardCard'
import { Heart, Target, DollarSign, BookOpen, Sparkles, TrendingUp } from 'lucide-react'

export default function ClientHome() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setIsLoaded(true)
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const dashboardCards = [
    {
      title: 'Mood Tracker',
      description: 'Track your daily emotional wellness',
      icon: Heart,
      href: '/mood-tracker',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Goal Tracker',
      description: 'Set and achieve your personal goals',
      icon: Target,
      href: '/goal-tracker',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Financial Care',
      description: 'Manage your financial wellness',
      icon: DollarSign,
      href: '/financial-care',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Journal',
      description: 'Reflect and document your journey',
      icon: BookOpen,
      href: '/journal',
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Self-Care Planner',
      description: 'Plan your wellness activities',
      icon: Sparkles,
      href: '/self-care',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Progress',
      description: 'View your wellness analytics',
      icon: TrendingUp,
      href: '/progress',
      color: 'from-violet-500 to-purple-500'
    }
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center animate-float">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            HerFlowState
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto text-balance">
            Your modern, scientific, feminine self-care toolkit for tracking moods, goals, and overall wellness.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} • {currentTime}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <DashboardCard
              key={card.title}
              {...card}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="card mb-8 animate-slide-up">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today&apos;s Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">7</div>
              <div className="text-sm text-gray-600">Days Tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-600">3</div>
              <div className="text-sm text-gray-600">Goals Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">12</div>
              <div className="text-sm text-gray-600">Journal Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">85%</div>
              <div className="text-sm text-gray-600">Wellness Score</div>
            </div>
          </div>
        </div>

        <Navigation />
      </div>
    </div>
  )
}