// src/components/goals/GoalCharts.tsx

'use client';

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Legend,
  Cell
} from 'recharts';
import { Goal, GoalProgress } from '@/types/goals';
import { TrendingUp, Activity, Target, Zap, AlertTriangle } from 'lucide-react';

interface GoalChartsProps {
  goal: Goal;
  progress: GoalProgress[];
  className?: string;
}

const GoalCharts: React.FC<GoalChartsProps> = ({ goal, progress, className = '' }) => {
  // Prepare progress trend data
  const progressTrendData = useMemo(() => {
    if (progress.length === 0) return [];
    
    const sortedProgress = [...progress].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return sortedProgress.map((entry, index) => {
      const date = entry.date;
      const daysPassed = Math.floor((date.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate theoretical optimal progress
      const totalDays = Math.floor((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const theoreticalProgress = (goal.targetValue * daysPassed) / totalDays;
      
      return {
        day: daysPassed,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: entry.value,
        theoretical: Math.max(0, theoreticalProgress),
        mood: entry.mood || null,
        efficiency: totalDays > 0 ? (entry.value / theoreticalProgress) * 100 : 100
      };
    });
  }, [progress, goal]);

  // Efficiency trend data for process optimization
  const efficiencyData = useMemo(() => {
    return progressTrendData.map(entry => ({
      ...entry,
      targetEfficiency: 100, // Reference line for 100% efficiency
      efficiencyZone: entry.efficiency >= 80 ? 'optimal' : entry.efficiency >= 60 ? 'acceptable' : 'needs-improvement'
    }));
  }, [progressTrendData]);

  // Daily rate analysis (like reaction kinetics)
  const rateAnalysisData = useMemo(() => {
    if (progressTrendData.length < 2) return [];
    
    return progressTrendData.slice(1).map((entry, index) => {
      const prevEntry = progressTrendData[index];
      const deltaValue = entry.actual - prevEntry.actual;
      const deltaDays = entry.day - prevEntry.day;
      const rate = deltaDays > 0 ? deltaValue / deltaDays : 0;
      
      return {
        date: entry.date,
        day: entry.day,
        rate: Math.max(0, rate), // Only positive rates
        targetRate: goal.targetValue / Math.floor((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        mood: entry.mood
      };
    });
  }, [progressTrendData, goal]);

  // Correlation analysis data
  const correlationData = useMemo(() => {
    return progressTrendData
      .filter(entry => entry.mood !== null)
      .map(entry => ({
        mood: entry.mood,
        progressRate: entry.efficiency,
        day: entry.day,
        date: entry.date
      }));
  }, [progressTrendData]);

  // Milestone progress data
  const milestoneData = useMemo(() => {
    const currentDate = new Date();
    return goal.milestones.map(milestone => {
      const daysUntilTarget = Math.floor((milestone.targetDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentProgress = (goal.currentValue / milestone.targetValue) * 100;
      
      return {
        title: milestone.title.substring(0, 15) + (milestone.title.length > 15 ? '...' : ''),
        fullTitle: milestone.title,
        progress: Math.min(100, currentProgress),
        target: 100,
        daysLeft: Math.max(0, daysUntilTarget),
        status: milestone.isCompleted ? 'completed' : daysUntilTarget < 0 ? 'overdue' : 'active'
      };
    });
  }, [goal]);

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              {entry.payload?.mood && (
                <span className="ml-2 text-gray-500">| Mood: {entry.payload.mood}/10</span>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getBarColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981'; // green
      case 'overdue': return '#EF4444'; // red
      case 'active': return '#8B5CF6'; // purple
      default: return '#6B7280'; // gray
    }
  };

  if (progress.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-xl p-8 text-center ${className}`}>
        <Activity size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Visualize</h3>
        <p className="text-gray-600">Add progress entries to see your optimization analytics</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Progress Trend Analysis */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Progress Trend Analysis</h3>
              <p className="text-sm text-gray-600">Actual vs Theoretical Optimal Path</p>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressTrendData}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="theoreticalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: `${goal.unit}`, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="theoretical"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#theoreticalGradient)"
                name="Theoretical Optimal"
                strokeDasharray="5 5"
              />
              
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#8B5CF6"
                strokeWidth={3}
                fill="url(#actualGradient)"
                name="Actual Progress"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Process Efficiency Analysis */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Process Efficiency Score</h3>
              <p className="text-sm text-gray-600">Chemical Engineering Optimization Metric</p>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft' }}
                domain={[0, 200]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Reference lines for efficiency zones */}
              <ReferenceLine y={100} stroke="#10B981" strokeDasharray="3 3" label="Optimal (100%)" />
              <ReferenceLine y={80} stroke="#F59E0B" strokeDasharray="2 2" label="Good (80%)" />
              <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="2 2" label="Needs Improvement (60%)" />
              
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                name="Efficiency Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rate Analysis (Kinetics) */}
      {rateAnalysisData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Progress Rate Analysis</h3>
                <p className="text-sm text-gray-600">Daily Progress Rate (Reaction Kinetics Model)</p>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateAnalysisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: `${goal.unit}/day`, angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                <ReferenceLine 
                  y={rateAnalysisData[0]?.targetRate || 0} 
                  stroke="#10B981" 
                  strokeDasharray="3 3" 
                  label="Target Rate" 
                />
                
                <Bar 
                  dataKey="rate" 
                  fill="#8B5CF6" 
                  name="Daily Progress Rate"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mood-Progress Correlation */}
      {correlationData.length > 2 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mood-Performance Correlation</h3>
                <p className="text-sm text-gray-600">Statistical Analysis of Emotional vs Progress Patterns</p>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  dataKey="mood"
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'Mood Score', position: 'insideBottom', offset: -10 }}
                  domain={[1, 10]}
                />
                <YAxis 
                  type="number"
                  dataKey="progressRate"
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <Scatter 
                  name="Progress vs Mood" 
                  dataKey="progressRate" 
                  fill="#8B5CF6"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Milestone Progress */}
      {goal.milestones.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Milestone Progress</h3>
                <p className="text-sm text-gray-600">Intermediate Target Achievement Analysis</p>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={milestoneData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                  label={{ value: 'Progress %', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="category"
                  dataKey="title"
                  stroke="#6b7280"
                  fontSize={12}
                  width={120}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-medium text-gray-900">{data.fullTitle}</p>
                          <p className="text-sm text-purple-600">Progress: {data.progress.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">Days left: {data.daysLeft}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                <Bar dataKey="progress" name="Progress" radius={[0, 4, 4, 0]}>
                  {milestoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalCharts;