import { Metadata } from 'next'
import ComingSoon from '@/components/ComingSoon'

export const metadata: Metadata = {
  title: 'Financial Care',
  description: 'Manage your financial wellness and money mindset',
}

export default function FinancialCarePage() {
  return <ComingSoon title="Financial Care" description="Manage your financial wellness and money mindset" />
}