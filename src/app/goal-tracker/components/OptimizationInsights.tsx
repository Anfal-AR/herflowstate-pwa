'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, AlertCircle, CheckCircle, BarChart3, Zap } from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  exercise: boolean;
  hydration: number;
  stress: number;
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

const OptimizationInsights: React.FC = () => {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [moodTrend, setMoodTrend] = useState<TrendAnalysis>({ trend: 'stable', rate: 0, significance: 0 });
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');

  // Simulate loading mood data (in real app, this would come from your tracker)
  useEffect(() => {
    const generateSampleData = (): MoodEntry[] => {
      const data: MoodEntry[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          mood: Math.random() * 4 + 3 + (i * 0.05), // Slight upward trend
          energy: Math.random() * 3 + 4,
          sleep: Math.random() * 2 + 6.5,
          exercise: Math.random() > 0.6,
          hydration: Math.random() * 4 + 6,
          stress: Math.random() * 3 + 2
        });
      }
      return data;
    };

    const data = generateSampleData();
    setMoodData(data);
    performOptimizationAnalysis(data);
  }, []);

  // Chemical Engineering Optimization Analysis
  const performOptimizationAnalysis = (data: MoodEntry[]) => {
    if (data.length < 7) return;

    // Calculate correlations using Pearson correlation coefficient
    const calculateCorrelation = (x: number[], y: number[]): number => {
      const n = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
      const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      
      return denominator === 0 ? 0 : numerator / denominator;
    };

    const moods = data.map(d => d.mood);
    const sleep = data.map(d => d.sleep);
    const energy = data.map(d => d.energy);
    const hydration = data.map(d => d.hydration);
    const stress = data.map(d => -d.stress); // Negative because lower stress = better
    const exercise = data.map(d => d.exercise ? 1 : 0);

    const correlations = [
      { param: 'Sleep Quality', corr: calculateCorrelation(moods, sleep), data: sleep },
      { param: 'Energy Levels', corr: calculateCorrelation(moods, energy), data: energy },
      { param: 'Hydration', corr: calculateCorrelation(moods, hydration), data: hydration },
      { param: 'Stress Management', corr: calculateCorrelation(moods, stress), data: stress },
      { param: 'Exercise', corr: calculateCorrelation(moods, exercise), data: exercise }
    ];

    // Generate optimization recommendations
    const results: OptimizationResult[] = correlations.map(({ param, corr, data: paramData }) => {
      const absCorr = Math.abs(corr);
      const impact = absCorr > 0.6 ? 'high' : absCorr > 0.3 ? 'medium' : 'low';
      const confidence = Math.min(95, absCorr * 100);
      
      let recommendation = '';
      const avgValue = paramData.reduce((a, b) => a + b, 0) / paramData.length;

      switch (param) {
        case 'Sleep Quality':
          recommendation = corr > 0.3 
            ? `Optimize sleep: Current avg ${avgValue.toFixed(1)}h. Target 7.5-8.5h for maximum mood correlation.`
            : `Sleep pattern stable. Current ${avgValue.toFixed(1)}h average.`;
          break;
        case 'Energy Levels':
          recommendation = corr > 0.3
            ? `Energy optimization shows strong mood correlation. Focus on consistent energy management.`
            : `Monitor energy patterns. Current correlation suggests stable baseline.`;
          break;
        case 'Hydration':
          recommendation = corr > 0.3
            ? `Hydration optimization: Current ${avgValue.toFixed(1)} glasses/day. Increase to 8-10 for mood benefits.`
            : `Maintain hydration levels. Current intake appears adequate.`;
          break;
        case 'Stress Management':
          recommendation = Math.abs(corr) > 0.3
            ? `High stress-mood correlation detected. Implement systematic stress reduction protocols.`
            : `Stress levels manageable. Continue current coping strategies.`;
          break;
        case 'Exercise':
          const exerciseRate = (avgValue * 100).toFixed(0);
          recommendation = corr > 0.2
            ? `Exercise correlation significant. Current ${exerciseRate}% frequency. Optimize timing and intensity.`
            : `Exercise routine stable at ${exerciseRate}% frequency.`;
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
    const recentMoods = moods.slice(-7);
    const earlierMoods = moods.slice(-14, -7);
    const recentAvg = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    const earlierAvg = earlierMoods.reduce((a, b) => a + b, 0) / earlierMoods.length;
    const trendRate = ((recentAvg - earlierAvg) / earlierAvg) * 100;

    setMoodTrend({
      trend: trendRate > 2 ? 'improving' : trendRate < -2 ? 'declining' : 'stable',
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Optimization Insights</h1>
        <p className="text-gray-600">ML-style wellness analytics using chemical engineering optimization principles</p>
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

export default OptimizationInsights;