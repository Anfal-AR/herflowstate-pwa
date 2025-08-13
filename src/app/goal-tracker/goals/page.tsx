// src/app/tracker/goals/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { Goal, GoalCategory, GoalPriority, GoalStatus, GoalProgress } from '@/types/goals';
import { GoalOptimizer } from '@/utils/goalOptimization';
import GoalCard from '@/components/goals/GoalCard';
import CreateGoalModal from '@/components/goals/CreateGoalModal';
import GoalDetailsModal from '@/components/goals/GoalDetailsModal';

const GoalTrackerPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressData, setProgressData] = useState<Record<string, GoalProgress[]>>({});
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<GoalCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('herflow-goals');
    const savedProgress = localStorage.getItem('herflow-goal-progress');
    
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
        deadline: new Date(goal.deadline),
        milestones: goal.milestones?.map((m: any) => ({
          ...m,
          targetDate: new Date(m.targetDate),
          completedAt: m.completedAt ? new Date(m.completedAt) : undefined
        })) || []
      }));
      setGoals(parsedGoals);
    }
    
    if (savedProgress) {
      const parsedProgress = JSON.parse(savedProgress);
      Object.keys(parsedProgress).forEach(goalId => {
        parsedProgress[goalId] = parsedProgress[goalId].map((p: any) => ({
          ...p,
          date: new Date(p.date)
        }));
      });
      setProgressData(parsedProgress);
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('herflow-goals', JSON.stringify(goals));
  }, [goals]);

  // Save progress data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('herflow-goal-progress', JSON.stringify(progressData));
  }, [progressData]);

  const handleCreateGoal = (newGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        completionRate: 0,
        timeRemaining: Math.ceil((newGoal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        averageDailyProgress: 0,
        projectedCompletion: newGoal.deadline,
        efficiencyScore: 0,
        consistencyScore: 50
      }
    };
    
    setGoals(prev => [...prev, goal]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateProgress = (goalId: string, value: number, notes?: string, mood?: number) => {
    const progress: GoalProgress = {
      goalId,
      date: new Date(),
      value,
      notes,
      mood
    };
    
    setProgressData(prev => ({
      ...prev,
      [goalId]: [...(prev[goalId] || []), progress]
    }));
    
    // Update goal current value and recalculate metrics
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const goalProgressData = [...(progressData[goalId] || []), progress];
        const metrics = GoalOptimizer.calculateGoalMetrics(goal, goalProgressData);
        
        return {
          ...goal,
          currentValue: value,
          updatedAt: new Date(),
          metrics,
          status: metrics.completionRate >= 100 ? GoalStatus.COMPLETED : goal.status
        };
      }
      return goal;
    }));
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailsModalOpen(true);
  };

  const filteredGoals = goals.filter(goal => {
    const categoryMatch = filterCategory === 'all' || goal.category === filterCategory;
    const statusMatch = filterStatus === 'all' || goal.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const activeGoals = goals.filter(g => g.status === GoalStatus.ACTIVE).length;
  const completedGoals = goals.filter(g => g.status === GoalStatus.COMPLETED).length;
  const avgCompletionRate = goals.length > 0 
    ? goals.reduce((sum, g) => sum + g.metrics.completionRate, 0) / goals.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                <Target size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Goal Tracker</h1>
                <p className="text-gray-600">Optimize your progress with data-driven insights</p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              <span>New Goal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-purple-600">{activeGoals}</p>
              </div>
              <Clock className="text-purple-400" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-blue-600">{avgCompletionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="text-blue-400" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-orange-600">
                  {goals.filter(g => g.metrics.efficiencyScore < 50).length}
                </p>
              </div>
              <AlertCircle className="text-orange-400" size={24} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as GoalCategory | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as GoalStatus | 'all')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {Object.values(GoalStatus).map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                progress={progressData[goal.id] || []}
                onClick={() => handleGoalClick(goal)}
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
            <p className="text-gray-600 mb-6">
              {goals.length === 0 
                ? "Start your optimization journey by creating your first goal"
                : "Try adjusting your filters to see more goals"
              }
            </p>
            {goals.length === 0 && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Create Your First Goal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGoal={handleCreateGoal}
      />

      {selectedGoal && (
        <GoalDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          goal={selectedGoal}
          progress={progressData[selectedGoal.id] || []}
          onUpdateProgress={handleUpdateProgress}
        />
      )}
    </div>
  );
};

export default GoalTrackerPage;