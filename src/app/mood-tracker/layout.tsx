import type { Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Mood Tracker | HerFlowState',
  description: 'Scientific approach to wellness optimization through data-driven insights and mood analytics',
  keywords: 'mood tracking, wellness analytics, mental health, data insights, correlation analysis',
};


export default function MoodTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}