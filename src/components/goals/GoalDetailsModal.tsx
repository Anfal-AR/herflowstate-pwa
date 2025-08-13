// src/components/goals/GoalDetailsModal.tsx - Updated with Charts Integration

'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  Calendar, 
  Target, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  BarChart3,
  Lightbulb,
  Zap
} from 'lucide-react';
import { Goal, GoalProgress, GoalStatus } from '@/types/goals';
import { GoalOptimizer } from '@/utils/goalOptimization';
import GoalCharts from '@/components/goals/GoalCharts';

interface GoalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  progress: GoalProgress[];
  onUpdateProgress: (goalId: string, value: number, notes?: string, mood?: number) => void;
}

const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  goal, 
  progress, 
  onUpdateProgress 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'analytics' | 'charts'>('overview');
  const [newProgress, setNewProgress] = useState({
    value: goal.currentValue,
    notes: '',
    mood: 7
  });
  const [showAddProgress, setShowAddProgress] = useState(false);

  // Calculate optimization analysis
  const optimizationAnalysis = useMemo(() => {
    return GoalOptimizer.analyzeGoalOptimization(goal, progress, [goal]);
  }, [goal, progress]);

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProgress(goal.id, newProgress.value, newProgress.notes, newProgress.mood);
    setNewProgress({ value: goal.currentValue, notes: '', mood: 7 });
    setShowAddProgress(false);
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE: return 'text-blue-600 bg-blue-100';
      case GoalStatus.COMPLETED: return 'text-green-600 bg-green-100';
      case GoalStatus.PAUSED: return 'text-yellow-600 bg-yellow-100';
      case GoalStatus.OVERDUE: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
  const totalMilestones = goal.milestones.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                <Target size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{goal.title}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                {goal.status}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{goal.description}</p>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <BarChart3 size={16} className="text-purple-500" />
                <span className="font-medium">{goal.metrics.completionRate.toFixed(1)}%</span>
                <span className="text-gray-500">complete</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-blue-500" />
                <span className="font-medium">{Math.ceil(goal.metrics.timeRemaining)}</span>
                <span className="text-gray-500">days left</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity size={16} className="text-green-500" />
                <span className="font-medium">{goal.metrics.efficiencyScore.toFixed(0)}%</span>
                <span className="text-gray-500">efficiency</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Edit size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Target },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'charts', label: 'Data Visualization', icon: BarChart3 },
              { id: 'analytics', label: 'AI Analytics', icon: Zap }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Current Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Value</span>
                      <span className="font-bold text-xl">{goal.currentValue} {goal.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Target Value</span>
                      <span className="font-semibold">{goal.targetValue} {goal.unit}</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                        style={{ width: `${Math.min(100, goal.metrics.completionRate)}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {goal.metrics.completionRate.toFixed(1)}% Complete
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Daily Rate</span>
                      <span className="font-semibold">{goal.metrics.averageDailyProgress.toFixed(2)} {goal.unit}/day</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Efficiency Score</span>
                      <span className="font-semibold">{goal.metrics.efficiencyScore.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Consistency</span>
                      <span className="font-semibold">{goal.metrics.consistencyScore.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Projected Completion</span>
                      <span className="font-semibold text-sm">
                        {goal.metrics.projectedCompletion.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {goal.milestones.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Milestones ({completedMilestones}/{totalMilestones})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {goal.milestones.map(milestone => (
                      <div 
                        key={milestone.id} 
                        className={`p-4 rounded-lg border-2 ${
                          milestone.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {milestone.isCompleted ? (
                              <CheckCircle className="text-green-500" size={20} />
                            ) : (
                              <Clock className="text-gray-400" size={20} />
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                              <p className="text-sm text-gray-600">
                                Target: {milestone.targetValue} {goal.unit} by {milestone.targetDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {milestone.isCompleted && milestone.completedAt && (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              Completed {milestone.completedAt.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Add Progress Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Update Progress</h3>
                  {!showAddProgress && (
                    <button
                      onClick={() => setShowAddProgress(true)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 
                                 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      <Plus size={16} />
                      <span>Add Progress</span>
                    </button>
                  )}
                </div>

                {showAddProgress && (
                  <form onSubmit={handleAddProgress} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Value ({goal.unit})
                        </label>
                        <input
                          type="number"
                          value={newProgress.value}
                          onChange={(e) => setNewProgress(prev => ({ ...prev, value: Number(e.target.value) }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 
                                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          min="0"
                          max={goal.targetValue}
                          step="0.1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mood (1-10)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={newProgress.mood}
                          onChange={(e) => setNewProgress(prev => ({ ...prev, mood: Number(e.target.value) }))}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-medium text-purple-600">
                          {newProgress.mood}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes (optional)
                        </label>
                        <input
                          type="text"
                          value={newProgress.notes}
                          onChange={(e) => setNewProgress(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 
                                     focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="How did it go?"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Save Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddProgress(false)}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Progress History */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recent Progress</h3>
                {progress.length > 0 ? (
                  <div className="space-y-3">
                    {progress
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .slice(0, 10)
                      .map((entry, index) => (
                        <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full" />
                              <span className="font-medium">{entry.value} {goal.unit}</span>
                              {entry.mood && (
                                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  Mood: {entry.mood}/10
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {entry.date.toLocaleDateString()} at {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-600 italic">"{entry.notes}"</p>
                          )}
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>No progress recorded yet</p>
                    <p className="text-sm">Add your first progress update above</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Visualization Tab */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Data Visualization Dashboard</h3>
                    <p className="text-sm text-gray-600">Interactive charts showing your progress patterns and optimization metrics</p>
                  </div>
                </div>
              </div>
              
              <GoalCharts 
                goal={goal} 
                progress={progress} 
                className="space-y-6"
              />
            </div>
          )}

          {/* AI Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Optimization Analysis */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="text-purple-600" size={20} />
                  <h3 className="font-semibold text-gray-900">Chemical Engineering Optimization Analysis</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Process Efficiency</h4>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-white rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                          style={{ width: `${optimizationAnalysis.currentEfficiency}%` }}
                        />
                      </div>
                      <span className="font-bold text-lg">{optimizationAnalysis.currentEfficiency.toFixed(0)}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Comparing actual progress rate vs theoretical optimal rate
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">System Status</h4>
                    <div className="flex items-center space-x-2">
                      {optimizationAnalysis.bottlenecks.length === 0 ? (
                        <>
                          <CheckCircle className="text-green-500" size={16} />
                          <span className="text-green-700 font-medium">Optimized Process</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="text-orange-500" size={16} />
                          <span className="text-orange-700 font-medium">
                            {optimizationAnalysis.bottlenecks.length} Bottleneck{optimizationAnalysis.bottlenecks.length > 1 ? 's' : ''} Detected
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottlenecks */}
              {optimizationAnalysis.bottlenecks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="text-orange-500" size={20} />
                    <span>Process Bottlenecks Analysis</span>
                  </h3>
                  <div className="space-y-3">
                    {optimizationAnalysis.bottlenecks.map((bottleneck, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <AlertTriangle className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                        <div className="flex-1">
                          <p className="text-orange-800 font-medium">Rate-Limiting Factor #{index + 1}</p>
                          <p className="text-orange-700 text-sm mt-1">{bottleneck}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimization Recommendations */}
              {optimizationAnalysis.recommendations.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Lightbulb className="text-yellow-500" size={20} />
                    <h3 className="font-semibold text-gray-900">Process Optimization Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    {optimizationAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-xs font-bold">
                                {rec.priority}
                              </span>
                              <span className="font-medium text-green-900">Priority {rec.priority} Optimization</span>
                            </div>
                            <p className="text-green-800">{rec.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                              +{rec.expectedImprovement}%
                            </span>
                            <p className="text-xs text-green-600 mt-1">Expected Improvement</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-green-700">
                          <span>Type: {rec.type.replace('_', ' ').toUpperCase()}</span>
                          <span>•</span>
                          <span>Implementation Impact: {rec.expectedImprovement > 25 ? 'High' : rec.expectedImprovement > 15 ? 'Medium' : 'Low'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correlation Analysis */}
              {optimizationAnalysis.correlationMatrix.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <BarChart3 className="text-blue-500" size={20} />
                    <span>Statistical Correlation Analysis</span>
                  </h3>
                  <div className="space-y-3">
                    {optimizationAnalysis.correlationMatrix.map((corr, index) => (
                      <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-blue-900">
                              {corr.variable1} ↔ {corr.variable2}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              Math.abs(corr.correlation) > 0.7 ? 'bg-red-100 text-red-800' :
                              Math.abs(corr.correlation) > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {Math.abs(corr.correlation) > 0.7 ? 'Strong' :
                               Math.abs(corr.correlation) > 0.5 ? 'Moderate' : 'Weak'} Correlation
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                              r = {corr.correlation.toFixed(3)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-blue-800 mb-2">{corr.interpretation}</p>
                        <div className="flex items-center justify-between text-xs text-blue-600">
                          <span>Statistical Significance: p = {corr.significance.toFixed(4)}</span>
                          <span className={`px-2 py-1 rounded ${
                            corr.significance < 0.05 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {corr.significance < 0.05 ? 'Statistically Significant' : 'Not Significant'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chemical Engineering Insights */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                    <Target size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">Chemical Engineering Process Insights</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Activity size={16} className="text-purple-500" />
                      <span>Mass Balance Analysis</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Input Rate: {goal.metrics.averageDailyProgress.toFixed(2)} {goal.unit}/day
                      <br />
                      Theoretical Rate: {(goal.targetValue / Math.max(1, Math.floor((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2)} {goal.unit}/day
                      <br />
                      Process Efficiency: {((goal.metrics.averageDailyProgress / Math.max(0.01, goal.targetValue / Math.max(1, Math.floor((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24))))) * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <TrendingUp size={16} className="text-green-500" />
                      <span>Reaction Kinetics Model</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Current Conversion: {goal.metrics.completionRate.toFixed(1)}%
                      <br />
                      Residence Time: {Math.floor((new Date().getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days
                      <br />
                      Projected Final Conversion: {Math.min(100, goal.metrics.completionRate * (Math.floor((goal.deadline.getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24)) / Math.max(1, Math.floor((new Date().getTime() - goal.createdAt.getTime()) / (1000 * 60 * 60 * 24))))).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Zap size={16} className="text-yellow-500" />
                      <span>Process Control</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Consistency Score: {goal.metrics.consistencyScore.toFixed(1)}% (CV: {((100 - goal.metrics.consistencyScore) / 100).toFixed(2)})
                      <br />
                      Control Status: {goal.metrics.consistencyScore > 70 ? 'Well Controlled' : goal.metrics.consistencyScore > 50 ? 'Moderate Control' : 'Requires Attention'}
                      <br />
                      Recommended Action: {goal.metrics.consistencyScore > 70 ? 'Maintain current approach' : 'Implement control strategy'}
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <Target size={16} className="text-blue-500" />
                      <span>Optimization Potential</span>
                    </h4>
                    <p className="text-sm text-gray-600">
                      Current Efficiency: {goal.metrics.efficiencyScore.toFixed(1)}%
                      <br />
                      Theoretical Maximum: 100%
                      <br />
                      Improvement Opportunity: {Math.max(0, 100 - goal.metrics.efficiencyScore).toFixed(1)}%
                      <br />
                      Status: {goal.metrics.efficiencyScore > 80 ? 'Optimized' : goal.metrics.efficiencyScore > 60 ? 'Good' : 'Needs Optimization'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalDetailsModal;