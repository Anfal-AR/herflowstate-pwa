'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

interface CorrelationChartProps {
  entries: MoodEntry[];
}

interface ScatterDataPoint {
  x: number;
  y: number;
  mood: number;
  date: string;
  activities: string[];
  hasExercise: boolean;
}

const CorrelationChart: React.FC<CorrelationChartProps> = ({ entries }) => {
  // Calculate correlation coefficient
  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Prepare data for different correlation analyses
  const moodEnergyData: ScatterDataPoint[] = entries.map(entry => ({
    x: entry.energy,
    y: entry.mood,
    mood: entry.mood,
    date: entry.timestamp.toLocaleDateString(),
    activities: entry.activities,
    hasExercise: entry.correlationFactors.exercise
  }));

  const moodSleepData: ScatterDataPoint[] = entries.map(entry => ({
    x: entry.sleep,
    y: entry.mood,
    mood: entry.mood,
    date: entry.timestamp.toLocaleDateString(),
    activities: entry.activities,
    hasExercise: entry.correlationFactors.exercise
  }));

  const moodStressData: ScatterDataPoint[] = entries.map(entry => ({
    x: entry.stress,
    y: entry.mood,
    mood: entry.mood,
    date: entry.timestamp.toLocaleDateString(),
    activities: entry.activities,
    hasExercise: entry.correlationFactors.exercise
  }));

  // Calculate correlations
  const energyCorr = calculateCorrelation(
    entries.map(e => e.energy),
    entries.map(e => e.mood)
  );
  
  const sleepCorr = calculateCorrelation(
    entries.map(e => e.sleep),
    entries.map(e => e.mood)
  );
  
  const stressCorr = calculateCorrelation(
    entries.map(e => -e.stress), // Negative because stress inversely affects mood
    entries.map(e => e.mood)
  );

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-pink-200">
          <p className="font-semibold text-gray-800 mb-2">{data.date}</p>
          <p className="text-pink-600">Mood: {data.mood}/10</p>
          <p className="text-blue-600">Value: {payload[0].payload.x}</p>
          {data.hasExercise && (
            <p className="text-green-600 text-sm mt-1">✓ Exercised</p>
          )}
          {data.activities.length > 0 && (
            <p className="text-gray-600 text-sm mt-1">
              Activities: {data.activities.slice(0, 2).join(', ')}
              {data.activities.length > 2 && ` +${data.activities.length - 2} more`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Color function for scatter points
  const getPointColor = (mood: number, hasExercise: boolean): string => {
    if (hasExercise) {
      return mood >= 7 ? '#10b981' : '#34d399'; // Green shades for exercise days
    }
    if (mood >= 8) return '#7c3aed'; // Purple for high mood
    if (mood >= 6) return '#3b82f6'; // Blue for good mood
    if (mood >= 4) return '#f59e0b'; // Orange for neutral
    return '#ef4444'; // Red for low mood
  };

  const correlationStrength = (corr: number): string => {
    const abs = Math.abs(corr);
    if (abs >= 0.8) return 'Very Strong';
    if (abs >= 0.6) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Correlation Analysis</h3>
        <div className="text-center text-gray-500 py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg mb-2">No data available for correlation analysis</p>
          <p className="text-sm">Add more mood entries to see scatter plots and correlations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Correlation Analysis
        </h3>
        <p className="text-gray-600">Statistical relationships between mood and lifestyle factors</p>
      </div>

      {/* Correlation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Energy ↔ Mood</span>
            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
              {correlationStrength(energyCorr)}
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-800">
            r = {energyCorr.toFixed(3)}
          </div>
          <div className="text-sm text-blue-600">
            {energyCorr > 0 ? 'Positive' : 'Negative'} correlation
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700">Sleep ↔ Mood</span>
            <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">
              {correlationStrength(sleepCorr)}
            </span>
          </div>
          <div className="text-2xl font-bold text-indigo-800">
            r = {sleepCorr.toFixed(3)}
          </div>
          <div className="text-sm text-indigo-600">
            {sleepCorr > 0 ? 'Positive' : 'Negative'} correlation
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Stress ↔ Mood</span>
            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
              {correlationStrength(stressCorr)}
            </span>
          </div>
          <div className="text-2xl font-bold text-red-800">
            r = {stressCorr.toFixed(3)}
          </div>
          <div className="text-sm text-red-600">
            Inverse relationship
          </div>
        </div>
      </div>

      {/* Scatter Plot Charts */}
      <div className="space-y-8">
        {/* Energy vs Mood */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Energy Level vs Mood</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={moodEnergyData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Energy" 
                unit="/10"
                domain={[1, 10]}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Mood" 
                unit="/10"
                domain={[1, 10]}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Mood vs Energy" data={moodEnergyData}>
                {moodEnergyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPointColor(entry.mood, entry.hasExercise)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep vs Mood */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Sleep Duration vs Mood</h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={moodSleepData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Sleep" 
                unit="h"
                domain={[3, 12]}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Mood" 
                unit="/10"
                domain={[1, 10]}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter name="Mood vs Sleep" data={moodSleepData}>
                {moodSleepData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPointColor(entry.mood, entry.hasExercise)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h5 className="font-medium text-gray-800 mb-3">Legend</h5>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Low Mood (1-3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Neutral (4-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Good Mood (6-7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-gray-600">Peak Mood (8-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Exercise Day</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationChart;