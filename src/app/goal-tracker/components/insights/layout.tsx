// src/app/tracker/components/insights/layout.tsx
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Optimization Insights | HerFlowState',
  description: 'ML-style wellness analytics using chemical engineering optimization principles',
  keywords: 'mood tracking, wellness analytics, optimization, mental health, insights',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Add any other viewport settings you need
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}