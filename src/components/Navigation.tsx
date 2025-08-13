'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, Target, DollarSign, BookOpen, Sparkles } from 'lucide-react'

const navigationItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/mood-tracker', icon: Heart, label: 'Mood' },
  { href: '/goal-tracker', icon: Target, label: 'Goals' },
  { href: '/financial-care', icon: DollarSign, label: 'Finance' },
  { href: '/journal', icon: BookOpen, label: 'Journal' },
  { href: '/self-care', icon: Sparkles, label: 'Self-Care' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-primary-600 bg-primary-50 scale-105' 
                  : 'text-gray-500 hover:text-primary-500 hover:bg-primary-50/50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}