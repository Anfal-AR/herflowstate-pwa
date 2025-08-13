// src/utils/goalOptimization.ts

import { Goal, GoalProgress, GoalMetrics, OptimizationAnalysis, OptimizationRecommendation } from '@/types/goals';

export class GoalOptimizer {
  /**
   * Calculate goal metrics using chemical engineering optimization principles
   */
  static calculateGoalMetrics(goal: Goal, progressData: GoalProgress[]): GoalMetrics {
    const now = new Date();
    const timeTotal = goal.deadline.getTime() - goal.createdAt.getTime();
    const timeElapsed = now.getTime() - goal.createdAt.getTime();
    const timeRemaining = Math.max(0, goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    const completionRate = (goal.currentValue / goal.targetValue) * 100;
    
    // Calculate average daily progress (mass transfer rate analogy)
    const dailyProgress = progressData.length > 1 
      ? this.calculateAverageDailyProgress(progressData)
      : goal.currentValue / (timeElapsed / (1000 * 60 * 60 * 24));
    
    // Project completion date using current rate
    const projectedDays = (goal.targetValue - goal.currentValue) / Math.max(dailyProgress, 0.001);
    const projectedCompletion = new Date(now.getTime() + projectedDays * 24 * 60 * 60 * 1000);
    
    // Efficiency score (actual vs theoretical optimal progress)
    const theoreticalRate = goal.targetValue / (timeTotal / (1000 * 60 * 60 * 24));
    const efficiencyScore = Math.min(100, (dailyProgress / theoreticalRate) * 100);
    
    // Consistency score (inverse of coefficient of variation)
    const consistencyScore = this.calculateConsistencyScore(progressData);
    
    return {
      completionRate,
      timeRemaining,
      averageDailyProgress: dailyProgress,
      projectedCompletion,
      efficiencyScore,
      consistencyScore
    };
  }
  
  /**
   * Calculate average daily progress using numerical differentiation
   */
  private static calculateAverageDailyProgress(progressData: GoalProgress[]): number {
    if (progressData.length < 2) return 0;
    
    const sortedData = progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
    let totalProgress = 0;
    let totalDays = 0;
    
    for (let i = 1; i < sortedData.length; i++) {
      const progress = sortedData[i].value - sortedData[i-1].value;
      const days = (sortedData[i].date.getTime() - sortedData[i-1].date.getTime()) / (1000 * 60 * 60 * 24);
      
      if (days > 0) {
        totalProgress += progress;
        totalDays += days;
      }
    }
    
    return totalDays > 0 ? totalProgress / totalDays : 0;
  }
  
  /**
   * Calculate consistency score using coefficient of variation
   */
  private static calculateConsistencyScore(progressData: GoalProgress[]): number {
    if (progressData.length < 3) return 50; // Default for insufficient data
    
    const dailyChanges = [];
    const sortedData = progressData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    for (let i = 1; i < sortedData.length; i++) {
      const change = sortedData[i].value - sortedData[i-1].value;
      dailyChanges.push(Math.max(0, change)); // Only positive changes
    }
    
    const mean = dailyChanges.reduce((sum, val) => sum + val, 0) / dailyChanges.length;
    const variance = dailyChanges.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyChanges.length;
    const stdDev = Math.sqrt(variance);
    
    // Coefficient of variation (lower is more consistent)
    const cv = mean > 0 ? stdDev / mean : 1;
    
    // Convert to score (0-100, higher is better)
    return Math.max(0, 100 - (cv * 100));
  }
  
  /**
   * Perform optimization analysis using process engineering principles
   */
  static analyzeGoalOptimization(goal: Goal, progressData: GoalProgress[], allGoals: Goal[]): OptimizationAnalysis {
    const metrics = this.calculateGoalMetrics(goal, progressData);
    const bottlenecks = this.identifyBottlenecks(goal, metrics, progressData);
    const recommendations = this.generateRecommendations(goal, metrics, bottlenecks);
    const correlationMatrix = this.calculateCorrelations(goal, progressData, allGoals);
    
    return {
      currentEfficiency: metrics.efficiencyScore,
      bottlenecks,
      recommendations,
      correlationMatrix
    };
  }
  
  /**
   * Identify bottlenecks using process analysis
   */
  private static identifyBottlenecks(goal: Goal, metrics: GoalMetrics, progressData: GoalProgress[]): string[] {
    const bottlenecks: string[] = [];
    
    if (metrics.efficiencyScore < 50) {
      bottlenecks.push('Low progress rate - may need increased frequency or intensity');
    }
    
    if (metrics.consistencyScore < 40) {
      bottlenecks.push('High variability in progress - inconsistent effort patterns');
    }
    
    if (metrics.timeRemaining < 7 && metrics.completionRate < 80) {
      bottlenecks.push('Time constraint - approaching deadline with significant work remaining');
    }
    
    // Check for stagnation (no progress in last 7 days)
    const recentProgress = progressData
      .filter(p => new Date().getTime() - p.date.getTime() < 7 * 24 * 60 * 60 * 1000)
      .length;
    
    if (recentProgress === 0 && progressData.length > 0) {
      bottlenecks.push('Progress stagnation - no recent activity recorded');
    }
    
    return bottlenecks;
  }
  
  /**
   * Generate optimization recommendations
   */
  private static generateRecommendations(
    goal: Goal, 
    metrics: GoalMetrics, 
    bottlenecks: string[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];
    
    if (metrics.efficiencyScore < 60) {
      recommendations.push({
        type: 'increase_frequency',
        priority: 1,
        description: 'Increase activity frequency by 25-50% to improve progress rate',
        expectedImprovement: 30
      });
    }
    
    if (metrics.consistencyScore < 50) {
      recommendations.push({
        type: 'add_support',
        priority: 2,
        description: 'Add accountability measures or tracking reminders to improve consistency',
        expectedImprovement: 25
      });
    }
    
    if (metrics.completionRate > 80 && metrics.timeRemaining > 30) {
      recommendations.push({
        type: 'adjust_target',
        priority: 3,
        description: 'Consider increasing target value to maintain challenge level',
        expectedImprovement: 15
      });
    }
    
    return recommendations.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Calculate correlations between different goal metrics
   */
  private static calculateCorrelations(goal: Goal, progressData: GoalProgress[], allGoals: Goal[]) {
    // Simplified correlation analysis - in a full implementation,
    // this would analyze relationships between different goal types,
    // mood data, and progress patterns
    return [
      {
        variable1: 'Daily Progress',
        variable2: 'Mood Score',
        correlation: 0.65,
        significance: 0.02,
        interpretation: 'Moderate positive correlation between progress and mood'
      }
    ];
  }
}