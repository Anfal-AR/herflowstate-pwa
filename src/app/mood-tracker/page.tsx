import { Metadata } from 'next'
import MoodTracker from '@/components/MoodTracker'

export const metadata: Metadata = {
  title: 'Mood Tracker',
  description: 'Track your daily emotional wellness and mental health patterns',
}

export default function MoodTrackerPage() {
  return <MoodTracker />
}