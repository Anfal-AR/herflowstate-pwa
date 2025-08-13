// src/components/goals/GoalCard.tsx

'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Plus,
  Activity
} from 'lucide-react';
import { Goal, GoalProgress, GoalStatus, GoalPriority } from '@/types/goals';

interface GoalCardProps {
  goal: Goal;
  progress: GoalProgress[];
  onClick: (goal: Goal) => void;
  onUpdateProgress: (goalId: string, value: number, notes?: string, mood?: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, progress, onClick, onUpdateProgress }) => {
  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  const [quickValue, setQuickValue] = useState(goal.currentValue);
  const [quickNotes, setQuickNotes] = useState('');

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.ACTIVE: return 'bg-blue-100 text-blue-800';
      case GoalStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case GoalStatus.PAUSED: return 'bg-yellow-100 text-yellow-800';
      case GoalStatus.OVERDUE: return 'bg-red-100 text-red-800';
      case GoalStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case GoalPriority.CRITICAL: return 'border-l-red-500';
      case GoalPriority.HIGH: return 'border-l-orange-500';
      case GoalPriority.MEDIUM: return 'border-l-yellow-500';
      case GoalPriority.LOW: return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getEfficiencyIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="text-green-500" size={16} />;
    if (score >= 60) return <Activity className="text-yellow-500" size={16} />;
    return <AlertTriangle className="text-red-500" size={16} />;
  };

  const handleQuickUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdateProgress(goal.id, quickValue, quickNotes);
    setIsQuickUpdateOpen(false);
    setQuickNotes('');
  };

  const daysRemaining = Math.ceil(goal.metrics.timeRemaining);
  const isOverdue = daysRemaining < 0;
  const isNearDeadline = daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <div 
      className={`bg-white rounded-xl border-l-4 ${getPriorityColor(goal.priority)} 
                  shadow-sm hover:shadow-md transition-all cursor-pointer p-6 space-y-4`}
      onClick={() => onClick(goal)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{goal.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
            {goal.status}
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            {getEfficiencyIcon(goal.metrics.efficiencyScore)}
            <span>{goal.metrics.efficiencyScore.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">
            {goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              goal.metrics.completionRate >= 100 
                ? 'bg-green-500' 
                : goal.metrics.completionRate >= 75 
                  ? 'bg-blue-500'
                  : goal.metrics.completionRate >= 50
                    ? 'bg-yellow-500'
                    : 'bg-purple-500'
            }`}
            style={{ width: `${Math.min(100, goal.metrics.completionRate)}%` }}
          />
        </div>
        <div className="text-right text-xs text-gray-500">
          {goal.metrics.completionRate.toFixed(1)}% complete
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-gray-400" />
          <div>
            <p className="text-gray-600">Deadline</p>
            <p className={`font-medium ${
              isOverdue ? 'text-red-600' : isNearDeadline ? 'text-orange-600' : 'text-gray-900'
            }`}>
              {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Target size={16} className="text-gray-400" />
          <div>
            <p className="text-gray-600">Daily Rate</p>
            <p className="font-medium text-gray-900">
              {goal.metrics.averageDailyProgress.toFixed(1)} {goal.unit}/day
            </p>
          </div>
        </div>
      </div>

      {/* Consistency Score */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Consistency</span>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
              style={{ width: `${goal.metrics.consistencyScore}%` }}
            />
          </div>
          <span className="font-medium text-gray-900">
            {goal.metrics.consistencyScore.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Quick Update Section */}
      {goal.status === GoalStatus.ACTIVE && (
        <div className="border-t pt-4">
          {!isQuickUpdateOpen ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsQuickUpdateOpen(true);
              }}
              className="w-full flex items-center justify-center space-x-2 text-purple-600 
                         hover:text-purple-700 text-sm font-medium py-2 rounded-lg 
                         hover:bg-purple-50 transition-colors"
            >
              <Plus size={16} />
              <span>Quick Update</span>
            </button>
          ) : (
            <form onSubmit={handleQuickUpdate} className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={quickValue}
                  onChange={(e) => setQuickValue(Number(e.target.value))}
                  className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm 
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={`Current: ${goal.currentValue}`}
                  min="0"
                  max={goal.targetValue}
                  step="0.1"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs text-gray-500">{goal.unit}</span>
              </div>
              <input
                type="text"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full border border-gray-300 rounded px-3 py-1 text-sm 
                           focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 text-white text-sm py-1.5 rounded 
                             hover:bg-purple-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsQuickUpdateOpen(false);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm py-1.5 rounded 
                             hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Completed Goal Badge */}
      {goal.status === GoalStatus.COMPLETED && (
        <div className="flex items-center justify-center space-x-2 text-green-600 py-2">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Goal Completed!</span>
        </div>
      )}
    </div>
  );
};

export default GoalCard;