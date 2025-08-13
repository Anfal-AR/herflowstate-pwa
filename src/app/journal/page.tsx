import { Metadata } from 'next'
import ComingSoon from '@/components/ComingSoon'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Reflect and document your personal growth journey',
}

export default function JournalPage() {
  return <ComingSoon title="Journal" description="Reflect and document your personal growth journey" />
}