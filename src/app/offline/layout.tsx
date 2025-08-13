import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - HerFlowState',
  description: 'You are currently offline. HerFlowState works offline too!',
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}