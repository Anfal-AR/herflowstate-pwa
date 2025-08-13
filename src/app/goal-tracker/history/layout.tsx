import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data History & Analytics - HerFlowState',
  description: 'Visual analytics and historical data of your wellness journey',
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}