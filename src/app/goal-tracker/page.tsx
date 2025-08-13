import { Metadata } from 'next'
import GoalTracker from '@/components/GoalTracker'

export const metadata: Metadata = {
  title: 'Goal Tracker',
  description: 'Set, track, and achieve your personal and professional goals',
}

export default function GoalTrackerPage() {
  return <GoalTracker />
}