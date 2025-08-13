// src/types/mood-tracker.ts

export interface MoodEntry {
  id: string;
  date: string;
  timestamp: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  sleep: number; // hours (0-12)
  hydration: number; // glasses (0-15)
  exercise: number; // minutes (0-120)
  nutrition: number; // 1-10 scale
  notes: string;
  factors: string[]; // Contributing factors
  weather?: string;
  location?: string;
}

export interface CorrelationData {
  factor: string;
  correlation: number;
  significance: number;
  sampleSize: number;
  interpretation: 'strong_positive' | 'moderate_positive' | 'weak_positive' | 
                  'weak_negative' | 'moderate_negative' | 'strong_negative' | 'negligible';
}

export interface StatisticalInsight {
  type: 'trend' | 'correlation' | 'anomaly' | 'pattern';
  title: string;
  description: string;
  confidence: number; // 0-100 percentage
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WellnessMetrics {
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  averageSleep: number;
  averageHydration: number;
  averageExercise: number;
  averageNutrition: number;
  consistencyScore: number; // Based on daily logging frequency
  improvementTrend: 'improving' | 'declining' | 'stable';
}

export interface OptimizationSuggestion {
  category: 'sleep' | 'exercise' | 'nutrition' | 'stress' | 'hydration' | 'lifestyle';
  priority: 1 | 2 | 3; // 1 = highest priority
  title: string;
  description: string;
  expectedImpact: number; // Predicted mood improvement (0-10)
  timeframe: string; // e.g., "1-2 weeks"
  difficulty: 'easy' | 'moderate' | 'challenging';
  basedOnCorrelation: number; // The correlation coefficient this is based on
}

export interface MoodPattern {
  patternType: 'weekly' | 'monthly' | 'seasonal' | 'cyclical';
  description: string;
  strength: number; // How pronounced the pattern is (0-1)
  peakDays: string[]; // Days/times when mood is typically highest
  lowDays: string[]; // Days/times when mood is typically lowest
  recommendations: string[];
}

export interface DataQualityMetric {
  completeness: number; // % of days with entries
  consistency: number; // Regularity of logging
  depth: number; // % of entries with notes/factors
  reliability: number; // Overall data quality score
  daysTracked: number;
  totalPossibleDays: number;
}

export interface TrendAnalysis {
  metric: keyof Pick<MoodEntry, 'mood' | 'energy' | 'stress' | 'sleep' | 'hydration' | 'exercise' | 'nutrition'>;
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number; // Rate of change per week
  significance: number; // Statistical significance
  timeframe: number; // Days of data used for analysis
}

export interface AdvancedInsights {
  correlations: CorrelationData[];
  trends: TrendAnalysis[];
  patterns: MoodPattern[];
  optimizations: OptimizationSuggestion[];
  predictions: {
    nextWeekMood: number;
    confidence: number;
    basedOn: string[];
  };
}

// Utility types for form handling
export type MoodEntryFormData = Omit<MoodEntry, 'id' | 'date' | 'timestamp'>;

export interface MoodFactorOption {
  id: string;
  label: string;
  category: 'physical' | 'emotional' | 'social' | 'environmental' | 'lifestyle';
  description?: string;
}

// Constants for mood factors
export const MOOD_FACTORS: MoodFactorOption[] = [
  // Physical factors
  { id: 'menstrual_cycle', label: 'Menstrual cycle', category: 'physical' },
  { id: 'illness', label: 'Illness/Health issues', category: 'physical' },
  { id: 'medication', label: 'Medication changes', category: 'physical' },
  { id: 'hormonal_changes', label: 'Hormonal changes', category: 'physical' },
  { id: 'chronic_pain', label: 'Chronic pain', category: 'physical' },
  
  // Emotional factors
  { id: 'work_stress', label: 'Work stress', category: 'emotional' },
  { id: 'relationship_issues', label: 'Relationship issues', category: 'emotional' },
  { id: 'financial_concerns', label: 'Financial concerns', category: 'emotional' },
  { id: 'anxiety', label: 'Anxiety/Worry', category: 'emotional' },
  { id: 'achievement', label: 'Achievement/Success', category: 'emotional' },
  { id: 'disappointment', label: 'Disappointment', category: 'emotional' },
  
  // Social factors
  { id: 'social_interaction', label: 'Social interaction', category: 'social' },
  { id: 'loneliness', label: 'Loneliness/Isolation', category: 'social' },
  { id: 'family_time', label: 'Quality family time', category: 'social' },
  { id: 'social_conflict', label: 'Social conflict', category: 'social' },
  
  // Environmental factors
  { id: 'weather', label: 'Weather changes', category: 'environmental' },
  { id: 'seasonal_changes', label: 'Seasonal changes', category: 'environmental' },
  { id: 'travel', label: 'Travel/Schedule changes', category: 'environmental' },
  { id: 'home_environment', label: 'Home environment', category: 'environmental' },
  
  // Lifestyle factors
  { id: 'caffeine', label: 'Caffeine intake', category: 'lifestyle' },
  { id: 'alcohol', label: 'Alcohol consumption', category: 'lifestyle' },
  { id: 'screen_time', label: 'Excessive screen time', category: 'lifestyle' },
  { id: 'social_media', label: 'Social media usage', category: 'lifestyle' },
  { id: 'news_consumption', label: 'News consumption', category: 'lifestyle' },
  { id: 'creative_activities', label: 'Creative activities', category: 'lifestyle' },
  { id: 'meditation', label: 'Meditation/Mindfulness', category: 'lifestyle' },
  { id: 'time_in_nature', label: 'Time in nature', category: 'lifestyle' },
];

// Chart configuration types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MultiSeriesChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
    fill?: boolean;
  }[];
}

// Analytics configuration
export interface AnalyticsConfig {
  minEntriesForCorrelation: number;
  minEntriesForTrends: number;
  confidenceThreshold: number;
  correlationThresholds: {
    strong: number;
    moderate: number;
    weak: number;
  };
}

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  minEntriesForCorrelation: 7,
  minEntriesForTrends: 14,
  confidenceThreshold: 0.05,
  correlationThresholds: {
    strong: 0.5,
    moderate: 0.3,
    weak: 0.1
  }
};