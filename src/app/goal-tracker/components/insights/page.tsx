'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, AlertCircle, CheckCircle, BarChart3, Zap, ArrowLeft } from 'lucide-react';

// Types
interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  exercise: boolean;
  hydration: number;
  stress: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface OptimizationResult {
  parameter: string;
  correlation: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  confidence: number;
}

interface TrendAnalysis {
  trend: 'improving' | 'declining' | 'stable';
  rate: number;
  significance: number;
}

const OptimizationInsightsPage: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [moodTrend, setMoodTrend] = useState<TrendAnalysis>({ trend: 'stable', rate: 0, significance: 0 });
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadMoodData();
  }, []);

  // Perform analysis when data or timeframe changes
  useEffect(() => {
    if (entries.length > 0) {
      performOptimizationAnalysis();
    }
  }, [entries, selectedTimeframe]);

  const loadMoodData = () => {
    try {
      setIsLoading(true);
      
      // Try to load from localStorage first
      const savedData = typeof window !== 'undefined' ? localStorage.getItem('herflowstate-mood-entries') : null;
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setEntries(parsedData);
      } else {
        // Generate sample data for development
        const sampleData = generateSampleData();
        setEntries(sampleData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('herflowstate-mood-entries', JSON.stringify(sampleData));
        }
      }
    } catch (err) {
      setError('Failed to load mood data');
      console.error('Error loading mood data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleData = (): MoodEntry[] => {
    const data: MoodEntry[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Create realistic patterns in the data
      const weekday = date.getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      const sleepBase = isWeekend ? 8 : 7;
      const moodTrend = i * 0.02; // Slight improvement over time
      
      data.push({
        id: `entry-${i}`,
        date: date.toISOString().split('T')[0],
        mood: Math.max(1, Math.min(10, 5.5 + Math.random() * 2 + moodTrend)),
        energy: Math.max(1, Math.min(10, 6 + Math.random() * 2 + (isWeekend ? 0.5 : -0.5))),
        sleep: Math.max(4, Math.min(12, sleepBase + (Math.random() - 0.5) * 2)),
        exercise: Math.random() > (isWeekend ? 0.3 : 0.6),
        hydration: Math.max(4, Math.min(12, 7 + Math.random() * 3)),
        stress: Math.max(1, Math.min(10, 4 + Math.random() * 3 + (isWeekend ? -1 : 1))),
        notes: i % 5 === 0 ? 'Sample note for analysis' : undefined,
        tags: i % 7 === 0 ? ['work-stress', 'tired'] : undefined,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    }
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getRecentEntries = (days: number): MoodEntry[] => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  const calculateAverage = (entries: MoodEntry[], field: keyof MoodEntry): number => {
    if (entries.length === 0) return 0;
    const numericEntries = entries.filter(entry => typeof entry[field] === 'number');
    if (numericEntries.length === 0) return 0;
    const sum = numericEntries.reduce((acc, entry) => acc + (entry[field] as number), 0);
    return sum / numericEntries.length;
  };

  const performOptimizationAnalysis = () => {
    const daysMap = { week: 7, month: 30, quarter: 90 };
    const days = daysMap[selectedTimeframe];
    const recentEntries = getRecentEntries(days);
    
    if (recentEntries.length < 3) {
      setOptimizations([]);
      return;
    }

    // Calculate correlations using Pearson correlation coefficient
    const calculateCorrelation = (x: number[], y: number[]): number => {
      const n = x.length;
      if (n < 3) return 0;
      
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      
      return denominator === 0 ? 0 : numerator / denominator;
    };

    const moods = recentEntries.map(d => d.mood);
    const sleep = recentEntries.map(d => d.sleep);
    const energy = recentEntries.map(d => d.energy);
    const hydration = recentEntries.map(d => d.hydration);
    const stress = recentEntries.map(d => -d.stress); // Negative because lower stress = better
    const exercise = recentEntries.map(d => d.exercise ? 1 : 0);

    const correlations = [
      { param: 'Sleep Quality', corr: calculateCorrelation(moods, sleep), avg: calculateAverage(recentEntries, 'sleep') },
      { param: 'Energy Levels', corr: calculateCorrelation(moods, energy), avg: calculateAverage(recentEntries, 'energy') },
      { param: 'Hydration', corr: calculateCorrelation(moods, hydration), avg: calculateAverage(recentEntries, 'hydration') },
      { param: 'Stress Management', corr: calculateCorrelation(moods, stress), avg: calculateAverage(recentEntries, 'stress') },
      { param: 'Exercise', corr: calculateCorrelation(moods, exercise), avg: recentEntries.filter(e => e.exercise).length / recentEntries.length }
    ];

    // Generate optimization recommendations
    const results: OptimizationResult[] = correlations.map(({ param, corr, avg }) => {
      const absCorr = Math.abs(corr);
      const impact = absCorr > 0.6 ? 'high' : absCorr > 0.3 ? 'medium' : 'low';
      const confidence = Math.min(95, absCorr * 100 + 20);
      
      let recommendation = '';

      switch (param) {
        case 'Sleep Quality':
          recommendation = corr > 0.3 
            ? `Optimize sleep: Current avg ${avg.toFixed(1)}h. Target 7.5-8.5h for maximum mood correlation (r=${corr.toFixed(2)}).`
            : corr < -0.3
            ? `Sleep quality negatively affecting mood. Consider sleep hygiene improvements.`
            : `Sleep pattern stable. Current ${avg.toFixed(1)}h average is adequate.`;
          break;
        case 'Energy Levels':
          recommendation = corr > 0.3
            ? `Strong energy-mood correlation detected. Focus on maintaining consistent energy levels (current avg: ${avg.toFixed(1)}).`
            : corr < -0.3
            ? `Energy fluctuations impacting mood. Consider energy management strategies.`
            : `Energy levels stable. Current patterns support mood stability.`;
          break;
        case 'Hydration':
          recommendation = corr > 0.3
            ? `Hydration optimization shows mood benefits. Current ${avg.toFixed(1)} glasses/day. Target 8-10 for optimal results.`
            : corr < -0.3
            ? `Over-hydration may be affecting mood. Consider balanced intake.`
            : `Hydration levels adequate. Current ${avg.toFixed(1)} glasses/day is balanced.`;
          break;
        case 'Stress Management':
          const stressAvg = calculateAverage(recentEntries, 'stress');
          recommendation = Math.abs(corr) > 0.3
            ? `Significant stress-mood correlation. Current stress avg: ${stressAvg.toFixed(1)}/10. Implement systematic reduction protocols.`
            : `Stress levels manageable. Current coping strategies appear effective.`;
          break;
        case 'Exercise':
          const exerciseRate = (avg * 100).toFixed(0);
          recommendation = corr > 0.2
            ? `Exercise shows positive mood correlation. Current ${exerciseRate}% frequency. Consider optimizing timing and consistency.`
            : corr < -0.2
            ? `Exercise pattern may need adjustment. Current ${exerciseRate}% frequency shows negative correlation.`
            : `Exercise routine stable at ${exerciseRate}% frequency. Continue current pattern.`;
          break;
      }

      return {
        parameter: param,
        correlation: corr,
        impact,
        recommendation,
        confidence
      };
    });

    // Calculate trend analysis
    const recentMoodAvg = calculateAverage(getRecentEntries(7), 'mood');
    const previousWeekEntries = entries.slice(7, 14);
    const previousMoodAvg = calculateAverage(previousWeekEntries, 'mood');
    const trendRate = previousMoodAvg > 0 ? ((recentMoodAvg - previousMoodAvg) / previousMoodAvg) * 100 : 0;

    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (trendRate > 5) trendDirection = 'improving';
    else if (trendRate < -5) trendDirection = 'declining';

    setMoodTrend({
      trend: trendDirection,
      rate: Math.abs(trendRate),
      significance: Math.min(100, Math.abs(trendRate) * 10)
    });

    setOptimizations(results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = () => {
    switch (moodTrend.trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'declining': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'stable': return <Target className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTrendColor = () => {
    switch (moodTrend.trend) {
      case 'improving': return 'border-green-200 bg-green-50';
      case 'declining': return 'border-red-200 bg-red-50';
      case 'stable': return 'border-blue-200 bg-blue-50';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading optimization insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-6">Start tracking your mood to see optimization insights.</p>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Optimization Insights</h1>
        <p className="text-gray-600">ML-style wellness analytics using chemical engineering optimization principles</p>
        <p className="text-sm text-gray-500 mt-2">Analyzing {entries.length} data points</p>
      </div>

      {/* Trend Analysis Card */}
      <div className={`border-2 rounded-xl p-6 ${getTrendColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getTrendIcon()}
            <h2 className="text-xl font-semibold">Trend Analysis</h2>
          </div>
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'week' | 'month' | 'quarter')}
            className="px-3 py-1 border rounded-lg bg-white"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="quarter">Past Quarter</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Trend Direction</p>
            <p className="text-lg font-bold capitalize">{moodTrend.trend}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Rate of Change</p>
            <p className="text-lg font-bold">{moodTrend.rate.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Statistical Significance</p>
            <p className="text-lg font-bold">{moodTrend.significance.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Optimization Results */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Parameter Optimization Analysis</h2>
        </div>

        <div className="grid gap-4">
          {optimizations.map((opt, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">{opt.parameter}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(opt.impact)}`}>
                    {opt.impact.toUpperCase()} IMPACT
                  </span>
                  <span className="text-sm text-gray-500">
                    r = {opt.correlation.toFixed(3)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-3">{opt.recommendation}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-xs text-gray-500">
                    Correlation: {(opt.correlation * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Confidence: {opt.confidence.toFixed(0)}%
                  </div>
                </div>
                {opt.impact === 'high' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              
              {/* Correlation Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      opt.correlation > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.abs(opt.correlation) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <span>Optimization Action Items</span>
        </h2>
        
        <div className="grid gap-3">
          {optimizations
            .filter(opt => opt.impact === 'high' || Math.abs(opt.correlation) > 0.4)
            .slice(0, 3)
            .map((opt, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Focus on {opt.parameter}</p>
                  <p className="text-sm text-gray-600">{opt.recommendation}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Expected mood improvement: ~{(Math.abs(opt.correlation) * 15).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OptimizationInsightsPage;