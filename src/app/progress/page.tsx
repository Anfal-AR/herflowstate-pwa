import { Metadata } from 'next'
import ComingSoon from '@/components/ComingSoon'

export const metadata: Metadata = {
  title: 'Progress Analytics',
  description: 'View your wellness analytics and insights',
}

export default function ProgressPage() {
  return <ComingSoon title="Progress Analytics" description="View your wellness analytics and insights" />
}