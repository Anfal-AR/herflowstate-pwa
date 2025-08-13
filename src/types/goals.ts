// src/types/goals.ts

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  priority: GoalPriority;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
  milestones: Milestone[];
  metrics: GoalMetrics;
}

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  targetDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface GoalMetrics {
  completionRate: number; // 0-100%
  timeRemaining: number; // days
  averageDailyProgress: number;
  projectedCompletion: Date;
  efficiencyScore: number; // optimization metric
  consistencyScore: number; // variance analysis
}

export enum GoalCategory {
  MOOD = 'mood',
  SELFCARE = 'selfcare', 
  FITNESS = 'fitness',
  NUTRITION = 'nutrition',
  SLEEP = 'sleep',
  FINANCE = 'finance',
  LEARNING = 'learning',
  RELATIONSHIPS = 'relationships',
  CAREER = 'career',
  HABITS = 'habits'
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum GoalStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export interface GoalProgress {
  goalId: string;
  date: Date;
  value: number;
  notes?: string;
  mood?: number; // 1-10 correlation analysis
}

// Chemical Engineering Optimization Models
export interface OptimizationAnalysis {
  currentEfficiency: number; // Current progress rate vs optimal
  bottlenecks: string[]; // Limiting factors
  recommendations: OptimizationRecommendation[];
  correlationMatrix: CorrelationData[];
}

export interface OptimizationRecommendation {
  type: 'increase_frequency' | 'adjust_target' | 'change_approach' | 'add_support';
  priority: number;
  description: string;
  expectedImprovement: number; // % improvement predicted
}

export interface CorrelationData {
  variable1: string;
  variable2: string;
  correlation: number; // -1 to 1
  significance: number; // p-value
  interpretation: string;
}