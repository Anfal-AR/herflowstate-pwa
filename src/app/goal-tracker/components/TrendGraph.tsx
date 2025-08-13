'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';

interface MoodEntry {
  id: string;
  timestamp: Date;
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  activities: string[];
  notes: string;
  correlationFactors: {
    weather: string;
    cycle: string;
    exercise: boolean;
    socialActivity: boolean;
  };
}

interface TrendGraphProps {
  entries: MoodEntry[];
}

interface TrendDataPoint {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  movingAverage: number;
  hasExercise: boolean;
  timestamp: number;
}
const TrendGraph: React.FC<TrendGraphProps> = ({ entries }) => {
  const [selectedMetric, setSelectedMetric] = useState<'mood' | 'energy' | 'stress' | 'sleep'>('mood');
  const [viewPeriod, setViewPeriod] = useState<'7d' | '30d' | 'all'>('30d');
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);

  const calculateMovingAverage = (data: number[], window: number = 3): number[] => {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const average = subset.reduce((sum, val) => sum + val, 0) / subset.length;
      result.push(average);
    }
    return result;
  };

  useEffect(() => {
    const sortedEntries = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const filterByPeriod = (entries: MoodEntry[]) => {
      if (viewPeriod === 'all') return entries;
      const now = Date.now();
      const daysBack = viewPeriod === '7d' ? 7 : 30;
      const cutoff = now - daysBack * 24 * 60 * 60 * 1000;
      return entries.filter(entry => new Date(entry.timestamp).getTime() >= cutoff);
    };

    const filteredEntries = filterByPeriod(sortedEntries);

    const moodValues = filteredEntries.map(e => e.mood);
    const energyValues = filteredEntries.map(e => e.energy);
    const stressValues = filteredEntries.map(e => e.stress);
    const sleepValues = filteredEntries.map(e => e.sleep);

    const moodMA = calculateMovingAverage(moodValues);
    const energyMA = calculateMovingAverage(energyValues);
    const stressMA = calculateMovingAverage(stressValues);
    const sleepMA = calculateMovingAverage(sleepValues);

    const data: TrendDataPoint[] = filteredEntries.map((entry, index) => ({
      date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood,
      energy: entry.energy,
      stress: entry.stress,
      sleep: entry.sleep,
      movingAverage:
        selectedMetric === 'mood' ? moodMA[index] :
        selectedMetric === 'energy' ? energyMA[index] :
        selectedMetric === 'stress' ? stressMA[index] : sleepMA[index],
      hasExercise: entry.correlationFactors.exercise,
      timestamp: new Date(entry.timestamp).getTime(),
    }));

    setTrendData(data);
  }, [entries, viewPeriod, selectedMetric]);
  const calculateTrendStats = () => {
    if (trendData.length < 2) return null;

    const values = trendData.map(d => d[selectedMetric]);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const percentChange = first !== 0 ? (change / first) * 100 : 0;

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const avgY = sumY / n;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const totalSS = values.reduce((sum, yi) => sum + Math.pow(yi - avgY, 2), 0);
    const residualSS = values.reduce((sum, yi, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = totalSS !== 0 ? 1 - (residualSS / totalSS) : 0;

    return {
      change: change.toFixed(2),
      percentChange: percentChange.toFixed(1),
      slope: slope.toFixed(3),
      rSquared: Math.max(0, rSquared).toFixed(3),
      direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
    };
  };

  const stats = calculateTrendStats();

  const getMetricColor = (metric: string): string => {
    switch (metric) {
      case 'mood': return 'text-pink-600';
      case 'energy': return 'text-blue-600';
      case 'stress': return 'text-red-600';
      case 'sleep': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricStroke = (metric: string): string => {
    switch (metric) {
      case 'mood': return '#ec4899';
      case 'energy': return '#3b82f6';
      case 'stress': return '#ef4444';
      case 'sleep': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const metricName = selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1);

      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-pink-200">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <p className={`font-medium ${getMetricColor(selectedMetric)}`}>
            {metricName}: {payload[0].value}{selectedMetric === 'sleep' ? 'h' : '/10'}
          </p>
          <p className="text-gray-600 text-sm">
            3-day average: {data.movingAverage.toFixed(1)}{selectedMetric === 'sleep' ? 'h' : '/10'}
          </p>
          {data.hasExercise && (
            <p className="text-green-600 text-sm mt-1">✓ Exercise day</p>
          )}
        </div>
      );
    }
    return null;
  };
  if (entries.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Trend Analysis</h3>
        <div className="text-center text-gray-500 py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p className="text-lg mb-2">No trend data available</p>
          <p className="text-sm">Add more mood entries to see trends over time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Trend Analysis
        </h3>
        <p className="text-gray-600">Time series analysis with moving averages and trend statistics</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Metric Selection */}
        <div className="flex gap-2">
          {(['mood', 'energy', 'stress', 'sleep'] as const).map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === metric
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>

        {/* Time Period Selection */}
        <div className="flex gap-2">
          {([['7d', '7 Days'], ['30d', '30 Days'], ['all', 'All Time']] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setViewPeriod(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewPeriod === value
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
            <div className="text-sm font-medium text-blue-700 mb-1">Total Change</div>
            <div className={`text-2xl font-bold ${stats.direction === 'improving' ? 'text-green-600' : stats.direction === 'declining' ? 'text-red-600' : 'text-gray-600'}`}>
              {Number(stats.change) > 0 ? '+' : ''}{stats.change}
            </div>
            <div className="text-sm text-blue-600">{stats.percentChange}% change</div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <div className="text-sm font-medium text-purple-700 mb-1">Trend Direction</div>
            <div className={`text-lg font-bold capitalize ${stats.direction === 'improving' ? 'text-green-600' : stats.direction === 'declining' ? 'text-red-600' : 'text-gray-600'}`}>
              {stats.direction}
              {stats.direction === 'improving' && ' ↗'}
              {stats.direction === 'declining' && ' ↘'}
              {stats.direction === 'stable' && ' →'}
            </div>
            <div className="text-sm text-purple-600">Slope: {stats.slope}</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <div className="text-sm font-medium text-green-700 mb-1">Trend Strength</div>
            <div className="text-2xl font-bold text-green-800">
              R² = {stats.rSquared}
            </div>
            <div className="text-sm text-green-600">
              {parseFloat(stats.rSquared) > 0.7 ? 'Strong' : parseFloat(stats.rSquared) > 0.4 ? 'Moderate' : 'Weak'} fit
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
            <div className="text-sm font-medium text-orange-700 mb-1">Data Points</div>
            <div className="text-2xl font-bold text-orange-800">
              {trendData.length}
            </div>
            <div className="text-sm text-orange-600">
              {viewPeriod === '7d' ? 'Last 7 days' : viewPeriod === '30d' ? 'Last 30 days' : 'All time'}
            </div>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={trendData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getMetricStroke(selectedMetric)} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={getMetricStroke(selectedMetric)} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 12 }}
              domain={selectedMetric === 'sleep' ? [3, 12] : [1, 10]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Reference lines */}
            {selectedMetric === 'mood' && <ReferenceLine y={7} stroke="#10b981" strokeDasharray="2 2" label="Good mood threshold" />}
            {selectedMetric === 'energy' && <ReferenceLine y={6} stroke="#10b981" strokeDasharray="2 2" label="High energy threshold" />}
            {selectedMetric === 'stress' && <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="2 2" label="Manageable stress" />}
            {selectedMetric === 'sleep' && <ReferenceLine y={7.5} stroke="#10b981" strokeDasharray="2 2" label="Optimal sleep" />}

            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricStroke(selectedMetric)}
              strokeWidth={3}
              fill="url(#colorMetric)"
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke={getMetricStroke(selectedMetric)}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Days Insight */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h5 className="font-medium text-gray-800 mb-3">Key Insights</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
              <span className="text-sm text-gray-600">Actual {selectedMetric} values</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 border-t-2 border-dashed border-pink-500"></div>
              <span className="text-sm text-gray-600">3-day moving average</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-1">
              Exercise days: {trendData.filter(d => d.hasExercise).length} of {trendData.length}
            </p>
            {stats && parseFloat(stats.rSquared) > 0.5 && (
              <p>
               Strong trend detected (R² = {stats.rSquared})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendGraph;
