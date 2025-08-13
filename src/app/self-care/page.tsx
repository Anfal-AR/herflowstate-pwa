import { Metadata } from 'next'
import ComingSoon from '@/components/ComingSoon'

export const metadata: Metadata = {
  title: 'Self-Care Planner',
  description: 'Plan and schedule your wellness activities',
}

export default function SelfCarePage() {
  return <ComingSoon title="Self-Care Planner" description="Plan and schedule your wellness activities" />
}