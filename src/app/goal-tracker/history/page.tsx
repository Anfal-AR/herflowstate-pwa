'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  ArrowLeft, TrendingUp, Calendar, Filter, Download, 
  Heart, Zap, Moon, Droplets, Activity, Brain,
  BarChart3, PieChart, Target, Settings
} from 'lucide-react';

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

interface ChartDataPoint {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  hydration: number;
  stress: number;
  exercise: number;
  formattedDate: string;
}

interface MetricStats {
  current: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

const DataVisualizationCharts: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'area' | 'radar'>('line');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['mood', 'energy', 'sleep']);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, MetricStats>>({});

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Update chart data when entries or timeframe changes
  useEffect(() => {
    if (entries.length > 0) {
      processChartData();
      calculateStats();
    }
  }, [entries, selectedTimeframe]);

  const loadData = () => {
    try {
      setIsLoading(true);
      const savedEntries = typeof window !== 'undefined' ? localStorage.getItem('herflowstate-mood-entries') : null;
      
      if (savedEntries) {
        const parsedEntries: MoodEntry[] = JSON.parse(savedEntries);
        setEntries(parsedEntries);
      } else {
        // Generate sample data for development
        const sampleData = generateSampleData();
        setEntries(sampleData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('herflowstate-mood-entries', JSON.stringify(sampleData));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleData = (): MoodEntry[] => {
    const data: MoodEntry[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 3 months of data

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const weekday = date.getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      const moodTrend = Math.sin(i * 0.05) * 1.5 + (i * 0.01); // Cyclical with slight upward trend
      
      data.push({
        id: `sample-${i}`,
        date: date.toISOString().split('T')[0],
        mood: Math.max(1, Math.min(10, 6 + moodTrend + (Math.random() - 0.5))),
        energy: Math.max(1, Math.min(10, 6 + Math.sin(i * 0.1) * 1.5 + (Math.random() - 0.5))),
        sleep: Math.max(4, Math.min(12, (isWeekend ? 8.5 : 7) + (Math.random() - 0.5) * 1.5)),
        exercise: Math.random() > (isWeekend ? 0.4 : 0.7),
        hydration: Math.max(4, Math.min(15, 8 + (Math.random() - 0.5) * 3)),
        stress: Math.max(1, Math.min(10, 5 - moodTrend * 0.5 + (Math.random() - 0.5) * 2)),
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    }
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processChartData = () => {
    const timeframes = {
      week: 7,
      month: 30,
      '3months': 90,
      year: 365
    };

    const days = timeframes[selectedTimeframe];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredEntries = entries
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const processedData: ChartDataPoint[] = filteredEntries.map(entry => ({
      date: entry.date,
      mood: Math.round(entry.mood * 10) / 10,
      energy: Math.round(entry.energy * 10) / 10,
      sleep: Math.round(entry.sleep * 10) / 10,
      hydration: entry.hydration,
      stress: Math.round(entry.stress * 10) / 10,
      exercise: entry.exercise ? 1 : 0,
      formattedDate: new Date(entry.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));

    setChartData(processedData);
  };

  const calculateStats = () => {
    if (chartData.length === 0) return;

    const metrics = ['mood', 'energy', 'sleep', 'hydration', 'stress'];
    const newStats: Record<string, MetricStats> = {};

    metrics.forEach(metric => {
      const values = chartData.map(d => d[metric as keyof ChartDataPoint] as number);
      const current = values[values.length - 1] || 0;
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Calculate trend (comparing last 25% vs first 25% of data)
      const quarter = Math.floor(values.length / 4);
      const firstQuarter = values.slice(0, quarter);
      const lastQuarter = values.slice(-quarter);
      
      const firstAvg = firstQuarter.reduce((sum, val) => sum + val, 0) / firstQuarter.length;
      const lastAvg = lastQuarter.reduce((sum, val) => sum + val, 0) / lastQuarter.length;
      const change = ((lastAvg - firstAvg) / firstAvg) * 100;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(change) > 5) {
        trend = change > 0 ? 'up' : 'down';
      }

      newStats[metric] = {
        current: Math.round(current * 10) / 10,
        average: Math.round(average * 10) / 10,
        trend,
        change: Math.round(Math.abs(change))
      };
    });

    setStats(newStats);
  };

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const getMetricColor = (metric: string) => {
    const colors = {
      mood: '#ef4444', // red
      energy: '#f59e0b', // amber
      sleep: '#3b82f6', // blue
      hydration: '#06b6d4', // cyan
      stress: '#8b5cf6', // violet
      exercise: '#10b981' // emerald
    };
    return colors[metric as keyof typeof colors] || '#6b7280';
  };

  const getMetricIcon = (metric: string) => {
    const icons = {
      mood: <Heart className="w-4 h-4" />,
      energy: <Zap className="w-4 h-4" />,
      sleep: <Moon className="w-4 h-4" />,
      hydration: <Droplets className="w-4 h-4" />,
      stress: <Brain className="w-4 h-4" />,
      exercise: <Activity className="w-4 h-4" />
    };
    return icons[metric as keyof typeof icons];
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="formattedDate" 
          className="text-xs"
          interval="preserveStartEnd"
        />
        <YAxis domain={[0, 10]} className="text-xs" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        {selectedMetrics.map(metric => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={getMetricColor(metric)}
            strokeWidth={2}
            dot={{ r: 3 }}
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="formattedDate" 
          className="text-xs"
          interval="preserveStartEnd"
        />
        <YAxis domain={[0, 10]} className="text-xs" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        {selectedMetrics.map(metric => (
          <Area
            key={metric}
            type="monotone"
            dataKey={metric}
            stackId="1"
            stroke={getMetricColor(metric)}
            fill={getMetricColor(metric)}
            fillOpacity={0.3}
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="formattedDate" 
          className="text-xs"
          interval="preserveStartEnd"
        />
        <YAxis domain={[0, 10]} className="text-xs" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        {selectedMetrics.map(metric => (
          <Bar
            key={metric}
            dataKey={metric}
            fill={getMetricColor(metric)}
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
            opacity={0.8}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = () => {
    if (chartData.length === 0) return null;
    
    // Use the most recent data point for radar chart
    const recentData = chartData[chartData.length - 1];
    const radarData = [
      { metric: 'Mood', value: recentData.mood, fullMark: 10 },
      { metric: 'Energy', value: recentData.energy, fullMark: 10 },
      { metric: 'Sleep', value: recentData.sleep, fullMark: 10 },
      { metric: 'Hydration', value: recentData.hydration, fullMark: 15 },
      { metric: 'Stress (inv)', value: 10 - recentData.stress, fullMark: 10 }
    ];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" className="text-sm" />
          <PolarRadiusAxis angle={90} domain={[0, 10]} className="text-xs" />
          <Radar
            name="Current Levels"
            dataKey="value"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (selectedChart) {
      case 'line': return renderLineChart();
      case 'area': return renderAreaChart();
      case 'bar': return renderBarChart();
      case 'radar': return renderRadarChart();
      default: return renderLineChart();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wellness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Data Visualization</h1>
            <p className="text-gray-600 mt-2">Visual analytics of your wellness journey</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              {chartData.length} data points
            </span>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Timeframe Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Chart Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="radar">Radar Chart (Latest)</option>
              </select>
            </div>

            {/* Export Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(chartData, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `wellness-data-${selectedTimeframe}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="w-full flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Selection */}
        {selectedChart !== 'radar' && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metrics to Display</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {['mood', 'energy', 'sleep', 'hydration', 'stress', 'exercise'].map(metric => (
                <button
                  key={metric}
                  onClick={() => handleMetricToggle(metric)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    selectedMetrics.includes(metric)
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {getMetricIcon(metric)}
                  <span className="text-sm font-medium capitalize">{metric}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats).map(([metric, stat]) => (
            <div key={metric} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getMetricIcon(metric)}
                  <span className="text-sm font-medium text-gray-600 capitalize">{metric}</span>
                </div>
                {getTrendIcon(stat.trend)}
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-gray-900">{stat.current}</p>
                <p className="text-xs text-gray-500">Avg: {stat.average}</p>
                {stat.change > 0 && (
                  <p className="text-xs text-gray-500">±{stat.change}%</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedChart === 'radar' ? 'Current Wellness Profile' : 'Wellness Trends Over Time'}
            </h2>
          </div>
          
          {chartData.length > 0 ? (
            renderChart()
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-4">Start tracking your wellness metrics to see visualizations.</p>
              <button
                onClick={() => window.location.href = '/tracker/entry'}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create First Entry
              </button>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        {chartData.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Highest Performing Metrics</h4>
                {Object.entries(stats)
                  .sort((a, b) => b[1].current - a[1].current)
                  .slice(0, 2)
                  .map(([metric, stat]) => (
                    <div key={metric} className="flex items-center space-x-2 text-sm">
                      {getMetricIcon(metric)}
                      <span className="capitalize">{metric}: {stat.current}/10</span>
                      {stat.trend === 'up' && <span className="text-green-600 text-xs">↗ Improving</span>}
                    </div>
                  ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Areas for Focus</h4>
                {Object.entries(stats)
                  .sort((a, b) => a[1].current - b[1].current)
                  .slice(0, 2)
                  .map(([metric, stat]) => (
                    <div key={metric} className="flex items-center space-x-2 text-sm">
                      {getMetricIcon(metric)}
                      <span className="capitalize">{metric}: {stat.current}/10</span>
                      {stat.trend === 'down' && <span className="text-red-600 text-xs">↘ Declining</span>}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataVisualizationCharts;