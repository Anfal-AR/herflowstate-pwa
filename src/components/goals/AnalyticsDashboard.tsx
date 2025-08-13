// src/components/goals/AnalyticsDashboard.tsx

'use client';

import React, { useMemo, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Goal, GoalProgress, GoalCategory, GoalStatus } from '@/types/goals';
import { GoalOptimizer } from '@/utils/goalOptimization';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Filter,
  Download,
  Eye
} from 'lucide-react';

interface AnalyticsDashboardProps {
  goals: Goal[];
  progressData: Record<string, GoalProgress[]>;
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  goals, 
  progressData, 
  className = '' 
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | 'all'>('all');

  // Filter goals based on selections
  const filteredGoals = useMemo(() => {
    let filtered = goals;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(goal => goal.category === selectedCategory);
    }
    
    return filtered;
  }, [goals, selectedCategory]);

  // Overall performance metrics
  const overallMetrics = useMemo(() => {
    if (filteredGoals.length === 0) return null;
    
    const activeGoals = filteredGoals.filter(g => g.status === GoalStatus.ACTIVE);
    const completedGoals = filteredGoals.filter(g => g.status === GoalStatus.COMPLETED);
    const overdueGoals = filteredGoals.filter(g => g.status === GoalStatus.OVERDUE);
    
    const avgCompletion = filteredGoals.reduce((sum, g) => sum + g.metrics.completionRate, 0) / filteredGoals.length;
    const avgEfficiency = filteredGoals.reduce((sum, g) => sum + g.metrics.efficiencyScore, 0) / filteredGoals.length;
    const avgConsistency = filteredGoals.reduce((sum, g) => sum + g.metrics.consistencyScore, 0) / filteredGoals.length;
    
    return {
      totalGoals: filteredGoals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      overdueGoals: overdueGoals.length,
      completionRate: (completedGoals.length / filteredGoals.length) * 100,
      avgCompletion,
      avgEfficiency,
      avgConsistency
    };
  }, [filteredGoals]);

  // Category distribution data
  const categoryData = useMemo(() => {
    const categoryCounts = goals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    }, {} as Record<GoalCategory, number>);

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
      value: count,
      category
    }));
  }, [goals]);

  // Performance radar data
  const performanceRadarData = useMemo(() => {
    if (filteredGoals.length === 0) return [];
    
    const categories = Object.values(GoalCategory);
    
    return categories.map(category => {
      const categoryGoals = filteredGoals.filter(g => g.category === category);
      if (categoryGoals.length === 0) {
        return {
          category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
          efficiency: 0,
          completion: 0,
          consistency: 0
        };
      }
      
      const avgEfficiency = categoryGoals.reduce((sum, g) => sum + g.metrics.efficiencyScore, 0) / categoryGoals.length;
      const avgCompletion = categoryGoals.reduce((sum, g) => sum + g.metrics.completionRate, 0) / categoryGoals.length;
      const avgConsistency = categoryGoals.reduce((sum, g) => sum + g.metrics.consistencyScore, 0) / categoryGoals.length;
      
      return {
        category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
        efficiency: Math.round(avgEfficiency),
        completion: Math.round(avgCompletion),
        consistency: Math.round(avgConsistency)
      };
    }).filter(item => item.efficiency > 0 || item.completion > 0 || item.consistency > 0);
  }, [filteredGoals]);

  // Time-based performance trend
  const performanceTrend = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const trendData = [];
    
    for (let i = 0; i < days; i += Math.max(1, Math.floor(days / 10))) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      let totalEfficiency = 0;
      let totalCompletion = 0;
      let goalCount = 0;
      
      filteredGoals.forEach(goal => {
        const goalProgress = progressData[goal.id] || [];
        const progressAtDate = goalProgress
          .filter(p => p.date <= date)
          .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        
        if (progressAtDate) {
          const metrics = GoalOptimizer.calculateGoalMetrics(goal, goalProgress.filter(p => p.date <= date));
          totalEfficiency += metrics.efficiencyScore;
          totalCompletion += metrics.completionRate;
          goalCount++;
        }
      });
      
      if (goalCount > 0) {
        trendData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          efficiency: Math.round(totalEfficiency / goalCount),
          completion: Math.round(totalCompletion / goalCount),
          goals: goalCount
        });
      }
    }
    
    return trendData;
  }, [filteredGoals, progressData, timeRange]);

  // Bottleneck analysis across all goals
  const bottleneckAnalysis = useMemo(() => {
    const bottleneckTypes: Record<string, number> = {};
    
    filteredGoals.forEach(goal => {
      const analysis = GoalOptimizer.analyzeGoalOptimization(goal, progressData[goal.id] || [], filteredGoals);
      analysis.bottlenecks.forEach(bottleneck => {
        const type = bottleneck.includes('efficiency') ? 'Low Efficiency' :
                    bottleneck.includes('consistency') ? 'Poor Consistency' :
                    bottleneck.includes('time') ? 'Time Pressure' :
                    bottleneck.includes('stagnation') ? 'Progress Stagnation' : 'Other';
        bottleneckTypes[type] = (bottleneckTypes[type] || 0) + 1;
      });
    });
    
    return Object.entries(bottleneckTypes).map(([type, count]) => ({
      type,
      count,
      percentage: (count / filteredGoals.length) * 100
    }));
  }, [filteredGoals, progressData]);

  // Chart colors
  const CHART_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5A2B', '#EC4899'];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.name.includes('%') ? '' : entry.name.includes('Score') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!overallMetrics) {
    return (
      <div className={`bg-gray-50 rounded-xl p-8 text-center ${className}`}>
        <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-600">Create some goals to see your performance analytics</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GoalCategory | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {Object.values(GoalCategory).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="text-blue-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-blue-600">{overallMetrics.totalGoals}</span>
          </div>
          <h3 className="font-medium text-gray-900">Total Goals</h3>
          <p className="text-sm text-gray-600">
            {overallMetrics.activeGoals} active, {overallMetrics.completedGoals} completed
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-green-600">{overallMetrics.completionRate.toFixed(1)}%</span>
          </div>
          <h3 className="font-medium text-gray-900">Success Rate</h3>
          <p className="text-sm text-gray-600">Goals completed successfully</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Zap className="text-purple-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-purple-600">{overallMetrics.avgEfficiency.toFixed(0)}%</span>
          </div>
          <h3 className="font-medium text-gray-900">Avg Efficiency</h3>
          <p className="text-sm text-gray-600">Process optimization score</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-orange-600">{overallMetrics.avgConsistency.toFixed(0)}%</span>
          </div>
          <h3 className="font-medium text-gray-900">Consistency</h3>
          <p className="text-sm text-gray-600">Progress regularity score</p>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Performance Trend</h3>
              <p className="text-sm text-gray-600">Efficiency and completion over time</p>
            </div>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Score %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar 
                dataKey="completion" 
                fill="#8B5CF6" 
                name="Avg Completion %"
                opacity={0.7}
                radius={[2, 2, 0, 0]}
              />
              
              <Line
                type="monotone"
                dataKey="efficiency"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Avg Efficiency %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution & Performance Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Goal Distribution</h3>
              <p className="text-sm text-gray-600">Goals by category</p>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-medium text-gray-900">{data.name}</p>
                          <p className="text-sm text-purple-600">{data.value} goals</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Radar */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
              <Target size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Category Performance</h3>
              <p className="text-sm text-gray-600">Multi-dimensional analysis</p>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceRadarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Efficiency"
                  dataKey="efficiency"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Completion"
                  dataKey="completion"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Consistency"
                  dataKey="consistency"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottleneck Analysis */}
      {bottleneckAnalysis.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Bottleneck Analysis</h3>
              <p className="text-sm text-gray-600">Common optimization opportunities</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bottleneckAnalysis.map((bottleneck, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{bottleneck.type}</h4>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    {bottleneck.count} goals
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                    style={{ width: `${bottleneck.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-orange-700 mt-2">
                  {bottleneck.percentage.toFixed(1)}% of goals affected
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
            <Eye size={20} />
          </div>
          <h3 className="font-semibold text-gray-900">Key Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Goal Focus</h4>
            <p className="text-sm text-gray-600">
              {overallMetrics.activeGoals > 5 
                ? "Consider reducing active goals to improve focus and completion rates"
                : "Good goal balance - manageable number of active objectives"
              }
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">⚡ Efficiency Optimization</h4>
            <p className="text-sm text-gray-600">
              {overallMetrics.avgEfficiency < 60
                ? "Low efficiency detected - consider process optimization strategies"
                : overallMetrics.avgEfficiency > 80
                  ? "Excellent efficiency! Your optimization strategies are working well"
                  : "Good efficiency with room for improvement through process refinement"
              }
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📊 Consistency Pattern</h4>
            <p className="text-sm text-gray-600">
              {overallMetrics.avgConsistency < 50
                ? "Inconsistent progress patterns - consider adding accountability measures"
                : "Strong consistency in your goal pursuit approach"
              }
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">🚀 Success Rate</h4>
            <p className="text-sm text-gray-600">
              {overallMetrics.completionRate > 70
                ? "High success rate indicates well-calibrated goal setting"
                : overallMetrics.completionRate > 30
                  ? "Moderate success rate - consider adjusting goal difficulty or timeline"
                  : "Low completion rate suggests need for goal restructuring or support systems"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;