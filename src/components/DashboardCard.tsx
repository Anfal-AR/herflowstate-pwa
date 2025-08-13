'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
  delay?: number
}

export default function DashboardCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color, 
  delay = 0 
}: DashboardCardProps) {
  return (
    <Link 
      href={href}
      className="block group animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="card hover:shadow-xl transition-all duration-300 hover:scale-105 group-hover:bg-white/90 h-full">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm text-balance">
          {description}
        </p>
        <div className="mt-4 text-primary-500 text-sm font-medium group-hover:text-primary-600 transition-colors">
          Get started →
        </div>
      </div>
    </Link>
  )
}