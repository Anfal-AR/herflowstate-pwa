// src/lib/mood-analytics.ts
import { 
  MoodEntry, 
  CorrelationData, 
  TrendAnalysis, 
  OptimizationSuggestion,
  WellnessMetrics,
  MoodPattern,
  AdvancedInsights,
  DEFAULT_ANALYTICS_CONFIG
} from '@/types/mood-tracker';

// Type for valid mood entry keys that are numbers
type MoodEntryNumericKeys = 'mood' | 'energy' | 'stress' | 'sleep' | 'hydration' | 'exercise' | 'nutrition';

/**
 * Advanced analytics engine for mood tracking data
 * Applies chemical engineering optimization principles to wellness data
 */
export class MoodAnalytics {
  private entries: MoodEntry[];
  private config = DEFAULT_ANALYTICS_CONFIG;

  constructor(entries: MoodEntry[]) {
    this.entries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Pearson correlation coefficient calculation with significance testing
   */
  private pearsonCorrelation(x: number[], y: number[]): { r: number; p: number; n: number } {
    const n = x.length;
    if (n < 3) return { r: 0, p: 1, n };

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    const r = denominator === 0 ? 0 : numerator / denominator;
    
    // Calculate p-value using t-distribution approximation
    const t = Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r));
    const p = this.tTestPValue(t, n - 2);
    
    return { r, p, n };
  }

  /**
   * Approximate p-value calculation for t-test
   */
  private tTestPValue(t: number, df: number): number {
    // Simplified p-value calculation
    const x = df / (df + t * t);
    return this.betaIncomplete(df / 2, 0.5, x);
  }

  /**
   * Incomplete beta function approximation
   */
  private betaIncomplete(a: number, b: number, x: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    
    // Simple approximation for our use case
    const bt = Math.exp(this.logGamma(a + b) - this.logGamma(a) - this.logGamma(b) + 
                        a * Math.log(x) + b * Math.log(1 - x));
    
    if (x < (a + 1) / (a + b + 2)) {
      return bt * this.betaContinuedFraction(a, b, x) / a;
    } else {
      return 1 - bt * this.betaContinuedFraction(b, a, 1 - x) / b;
    }
  }

  /**
   * Log gamma function approximation
   */
  private logGamma(x: number): number {
    const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091,
                 -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    
    let ser = 1.000000000190015;
    let xx = x;
    let y = xx;
    let tmp = xx + 5.5;
    tmp -= (xx + 0.5) * Math.log(tmp);
    
    for (let j = 0; j <= 5; j++) {
      ser += cof[j] / ++y;
    }
    
    return -tmp + Math.log(2.5066282746310005 * ser / xx);
  }

  /**
   * Beta continued fraction
   */
  private betaContinuedFraction(a: number, b: number, x: number): number {
    const maxIter = 100;
    const eps = 3e-7;
    
    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;
    let c = 1;
    let d = 1 - qab * x / qap;
    
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    let h = d;
    
    for (let m = 1; m <= maxIter; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      h *= d * c;
      
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const del = d * c;
      h *= del;
      
      if (Math.abs(del - 1) < eps) break;
    }
    
    return h;
  }

  /**
   * Safely extract numeric value from mood entry
   */
  private getEntryValue(entry: MoodEntry, factor: string): number {
    const key = factor as keyof MoodEntry;
    const value = entry[key];
    
    if (typeof value === 'number') {
      return factor === 'stress' ? 10 - value : value; // Invert stress
    }
    
    // Handle any non-numeric values gracefully
    return 0;
  }

  /**
   * Calculate correlations between mood and other factors
   */
  public calculateCorrelations(): CorrelationData[] {
    if (this.entries.length < this.config.minEntriesForCorrelation) {
      return [];
    }

    const factors: MoodEntryNumericKeys[] = ['energy', 'stress', 'sleep', 'hydration', 'exercise', 'nutrition'];
    const correlationResults: CorrelationData[] = [];

    factors.forEach(factor => {
      const moodValues = this.entries.map(entry => entry.mood);
      const factorValues = this.entries.map(entry => this.getEntryValue(entry, factor));

      const result = this.pearsonCorrelation(moodValues, factorValues);
      
      let interpretation: CorrelationData['interpretation'];
      const absR = Math.abs(result.r);
      
      if (absR >= this.config.correlationThresholds.strong) {
        interpretation = result.r > 0 ? 'strong_positive' : 'strong_negative';
      } else if (absR >= this.config.correlationThresholds.moderate) {
        interpretation = result.r > 0 ? 'moderate_positive' : 'moderate_negative';
      } else if (absR >= this.config.correlationThresholds.weak) {
        interpretation = result.r > 0 ? 'weak_positive' : 'weak_negative';
      } else {
        interpretation = 'negligible';
      }

      correlationResults.push({
        factor: factor.charAt(0).toUpperCase() + factor.slice(1),
        correlation: result.r,
        significance: result.p,
        sampleSize: result.n,
        interpretation
      });
    });

    return correlationResults.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Linear regression for trend analysis
   */
  private linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, val, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    return { slope, intercept, r2 };
  }

  /**
   * Analyze trends in wellness metrics
   */
  public analyzeTrends(): TrendAnalysis[] {
    if (this.entries.length < this.config.minEntriesForTrends) {
      return [];
    }

    const metrics: MoodEntryNumericKeys[] = ['mood', 'energy', 'stress', 'sleep', 'hydration', 'exercise', 'nutrition'];
    const trends: TrendAnalysis[] = [];

    // Create time indices (days since first entry)
    const firstDate = new Date(this.entries[0].date).getTime();
    const timeIndices = this.entries.map(entry => 
      (new Date(entry.date).getTime() - firstDate) / (1000 * 60 * 60 * 24)
    );

    metrics.forEach(metric => {
      const values = this.entries.map(entry => this.getEntryValue(entry, metric));

      const regression = this.linearRegression(timeIndices, values);
      
      // Convert daily slope to weekly slope
      const weeklyChange = regression.slope * 7;
      
      let direction: TrendAnalysis['direction'];
      if (Math.abs(weeklyChange) < 0.1) {
        direction = 'stable';
      } else {
        direction = weeklyChange > 0 ? 'increasing' : 'decreasing';
      }

      trends.push({
        metric,
        direction,
        magnitude: Math.abs(weeklyChange),
        significance: regression.r2,
        timeframe: this.entries.length
      });
    });

    return trends.sort((a, b) => b.significance - a.significance);
  }

  /**
   * Generate optimization suggestions based on correlations
   */
  public generateOptimizations(): OptimizationSuggestion[] {
    const correlations = this.calculateCorrelations();
    const suggestions: OptimizationSuggestion[] = [];

    correlations.forEach(corr => {
      if (Math.abs(corr.correlation) >= this.config.correlationThresholds.weak && 
          corr.significance < this.config.confidenceThreshold) {
        
        let suggestion: OptimizationSuggestion;
        const factor = corr.factor.toLowerCase();

        switch (factor) {
          case 'sleep':
            suggestion = {
              category: 'sleep',
              priority: Math.abs(corr.correlation) > 0.5 ? 1 : 2,
              title: corr.correlation > 0 ? 'Optimize Sleep Duration' : 'Improve Sleep Quality',
              description: corr.correlation > 0 
                ? 'Increase sleep duration to 7-9 hours per night for better mood regulation.'
                : 'Focus on sleep quality through consistent bedtime routines and sleep hygiene.',
              expectedImpact: Math.abs(corr.correlation) * 3, // Scale to 0-3 range
              timeframe: '1-2 weeks',
              difficulty: 'moderate',
              basedOnCorrelation: corr.correlation
            };
            break;

          case 'exercise':
            suggestion = {
              category: 'exercise',
              priority: Math.abs(corr.correlation) > 0.4 ? 1 : 2,
              title: 'Increase Physical Activity',
              description: 'Regular exercise shows strong correlation with improved mood. Aim for 30 minutes of moderate activity daily.',
              expectedImpact: Math.abs(corr.correlation) * 2.5,
              timeframe: '2-3 weeks',
              difficulty: 'moderate',
              basedOnCorrelation: corr.correlation
            };
            break;

          case 'nutrition':
            suggestion = {
              category: 'nutrition',
              priority: 2,
              title: 'Improve Nutritional Quality',
              description: 'Focus on whole foods, balanced meals, and consistent eating patterns.',
              expectedImpact: Math.abs(corr.correlation) * 2,
              timeframe: '1-3 weeks',
              difficulty: 'easy',
              basedOnCorrelation: corr.correlation
            };
            break;

          case 'stress':
            suggestion = {
              category: 'stress',
              priority: 1,
              title: 'Implement Stress Management',
              description: 'Practice stress reduction techniques like meditation, deep breathing, or progressive muscle relaxation.',
              expectedImpact: Math.abs(corr.correlation) * 3.5,
              timeframe: '1-4 weeks',
              difficulty: 'moderate',
              basedOnCorrelation: corr.correlation
            };
            break;

          case 'hydration':
            suggestion = {
              category: 'hydration',
              priority: 3,
              title: 'Maintain Proper Hydration',
              description: 'Aim for 8-10 glasses of water daily. Dehydration can significantly impact mood and energy.',
              expectedImpact: Math.abs(corr.correlation) * 1.5,
              timeframe: '1 week',
              difficulty: 'easy',
              basedOnCorrelation: corr.correlation
            };
            break;

          case 'energy':
            suggestion = {
              category: 'lifestyle',
              priority: 2,
              title: 'Boost Energy Levels',
              description: 'Energy and mood are closely linked. Focus on sleep, nutrition, and regular activity.',
              expectedImpact: Math.abs(corr.correlation) * 2,
              timeframe: '2-4 weeks',
              difficulty: 'moderate',
              basedOnCorrelation: corr.correlation
            };
            break;

          default:
            return; // Skip unknown factors
        }

        suggestions.push(suggestion);
      }
    });

    return suggestions.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.expectedImpact - a.expectedImpact;
    });
  }

  /**
   * Calculate comprehensive wellness metrics
   */
  public calculateWellnessMetrics(): WellnessMetrics {
    if (this.entries.length === 0) {
      return {
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        averageSleep: 0,
        averageHydration: 0,
        averageExercise: 0,
        averageNutrition: 0,
        consistencyScore: 0,
        improvementTrend: 'stable'
      };
    }

    const recent = this.entries.slice(-14); // Last 2 weeks
    const older = this.entries.slice(-28, -14); // Previous 2 weeks

    const metrics = {
      averageMood: this.entries.reduce((sum, e) => sum + e.mood, 0) / this.entries.length,
      averageEnergy: this.entries.reduce((sum, e) => sum + e.energy, 0) / this.entries.length,
      averageStress: this.entries.reduce((sum, e) => sum + e.stress, 0) / this.entries.length,
      averageSleep: this.entries.reduce((sum, e) => sum + e.sleep, 0) / this.entries.length,
      averageHydration: this.entries.reduce((sum, e) => sum + e.hydration, 0) / this.entries.length,
      averageExercise: this.entries.reduce((sum, e) => sum + e.exercise, 0) / this.entries.length,
      averageNutrition: this.entries.reduce((sum, e) => sum + e.nutrition, 0) / this.entries.length,
      consistencyScore: Math.min(100, (this.entries.length / 30) * 100), // Based on 30-day tracking
      improvementTrend: 'stable' as WellnessMetrics['improvementTrend']
    };

    // Calculate improvement trend
    if (recent.length >= 7 && older.length >= 7) {
      const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
      const olderAvg = older.reduce((sum, e) => sum + e.mood, 0) / older.length;
      
      if (recentAvg > olderAvg + 0.3) {
        metrics.improvementTrend = 'improving';
      } else if (recentAvg < olderAvg - 0.3) {
        metrics.improvementTrend = 'declining';
      }
    }

    return metrics;
  }

  /**
   * Detect weekly patterns in mood data
   */
  public detectWeeklyPatterns(): MoodPattern[] {
    if (this.entries.length < 14) return [];

    const dayOfWeekMoods: { [key: string]: number[] } = {
      'Sunday': [], 'Monday': [], 'Tuesday': [], 'Wednesday': [],
      'Thursday': [], 'Friday': [], 'Saturday': []
    };

    this.entries.forEach(entry => {
      const dayName = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayOfWeekMoods[dayName].push(entry.mood);
    });

    const dayAverages = Object.entries(dayOfWeekMoods)
      .map(([day, moods]) => ({
        day,
        average: moods.length > 0 ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length : 0,
        count: moods.length
      }))
      .filter(item => item.count > 0);

    if (dayAverages.length < 4) return [];

    const maxMood = Math.max(...dayAverages.map(d => d.average));
    const minMood = Math.min(...dayAverages.map(d => d.average));
    const variation = maxMood - minMood;

    if (variation < 0.5) return []; // No significant pattern

    const peakDays = dayAverages.filter(d => d.average >= maxMood - 0.3).map(d => d.day);
    const lowDays = dayAverages.filter(d => d.average <= minMood + 0.3).map(d => d.day);

    return [{
      patternType: 'weekly',
      description: `Weekly mood pattern detected with ${variation.toFixed(1)} point variation`,
      strength: Math.min(1, variation / 3), // Normalize to 0-1 scale
      peakDays,
      lowDays,
      recommendations: [
        `Peak mood days (${peakDays.join(', ')}) - maintain current routines`,
        `Low mood days (${lowDays.join(', ')}) - plan extra self-care activities`
      ]
    }];
  }

  /**
   * Generate comprehensive insights combining all analytics
   */
  public generateAdvancedInsights(): AdvancedInsights {
    const correlations = this.calculateCorrelations();
    const trends = this.analyzeTrends();
    const patterns = this.detectWeeklyPatterns();
    const optimizations = this.generateOptimizations();

    // Simple mood prediction based on recent trends
    const recentEntries = this.entries.slice(-7);
    const avgRecentMood = recentEntries.length > 0 
      ? recentEntries.reduce((sum, e) => sum + e.mood, 0) / recentEntries.length
      : 5;
    
    const moodTrend = trends.find(t => t.metric === 'mood');
    const nextWeekMood = moodTrend 
      ? Math.max(1, Math.min(10, avgRecentMood + (moodTrend.magnitude * (moodTrend.direction === 'increasing' ? 1 : -1))))
      : avgRecentMood;

    const predictionFactors = [
      ...correlations.slice(0, 3).map(c => c.factor),
      ...(moodTrend ? [`${moodTrend.direction} mood trend`] : [])
    ];

    return {
      correlations,
      trends,
      patterns,
      optimizations,
      predictions: {
        nextWeekMood,
        confidence: Math.min(90, this.entries.length * 3), // Confidence increases with more data
        basedOn: predictionFactors
      }
    };
  }
}