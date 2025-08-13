// src/components/goals/CreateGoalModal.tsx

'use client';

import React, { useState } from 'react';
import { X, Target, Calendar, Flag, Lightbulb, Zap } from 'lucide-react';
import { Goal, GoalCategory, GoalPriority, GoalStatus, Milestone } from '@/types/goals';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => void;
}

// Type for form data to ensure type safety
interface FormData {
  title: string;
  description: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  priority: GoalPriority;
  status: GoalStatus;
}

// Type for new milestone input
interface NewMilestoneInput {
  title: string;
  targetValue: number;
  targetDate: string;
}

// Type for milestone template
interface MilestoneTemplate {
  title: string;
  targetValue: number;
  daysFromNow: number;
}

// Type for goal template
interface GoalTemplate {
  title: string;
  description: string;
  unit: string;
  targetValue: number;
  suggestedMilestones: MilestoneTemplate[];
}

// Type for goal templates object (partial to allow optional templates)
type GoalTemplates = {
  [K in GoalCategory]?: GoalTemplate;
};

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose, onCreateGoal }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: GoalCategory.SELFCARE,
    targetValue: 0,
    currentValue: 0,
    unit: '',
    deadline: '',
    priority: GoalPriority.MEDIUM,
    status: GoalStatus.ACTIVE
  });

  const [milestones, setMilestones] = useState<Omit<Milestone, 'id'>[]>([]);
  const [newMilestone, setNewMilestone] = useState<NewMilestoneInput>({
    title: '',
    targetValue: 0,
    targetDate: ''
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goalTemplates: GoalTemplates = {
    [GoalCategory.MOOD]: {
      title: 'Improve Daily Mood Score',
      description: 'Track and improve daily mood ratings through mindfulness and self-care',
      unit: 'points',
      targetValue: 8,
      suggestedMilestones: [
        { title: 'Reach 6.5 average mood', targetValue: 6.5, daysFromNow: 14 },
        { title: 'Reach 7.5 average mood', targetValue: 7.5, daysFromNow: 30 }
      ]
    },
    [GoalCategory.SELFCARE]: {
      title: 'Daily Self-Care Activities',
      description: 'Maintain consistent self-care routine with various wellness activities',
      unit: 'activities',
      targetValue: 30,
      suggestedMilestones: [
        { title: 'Complete 10 activities', targetValue: 10, daysFromNow: 10 },
        { title: 'Complete 20 activities', targetValue: 20, daysFromNow: 20 }
      ]
    },
    [GoalCategory.FITNESS]: {
      title: 'Weekly Exercise Sessions',
      description: 'Build a consistent fitness routine with regular exercise sessions',
      unit: 'sessions',
      targetValue: 24,
      suggestedMilestones: [
        { title: '8 sessions completed', targetValue: 8, daysFromNow: 14 },
        { title: '16 sessions completed', targetValue: 16, daysFromNow: 28 }
      ]
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.targetValue <= 0) newErrors.targetValue = 'Target value must be positive';
      if (!formData.unit.trim()) newErrors.unit = 'Unit is required';
    }

    if (stepNumber === 2) {
      if (!formData.deadline) newErrors.deadline = 'Deadline is required';
      else {
        const deadlineDate = new Date(formData.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (deadlineDate <= today) {
          newErrors.deadline = 'Deadline must be in the future';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (): void => {
    if (validateStep(step)) {
      setStep((step + 1) as 1 | 2 | 3);
    }
  };

  const handleBack = (): void => {
    setStep((step - 1) as 1 | 2 | 3);
  };

  const applyTemplate = (category: GoalCategory): void => {
    const template = goalTemplates[category];
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        description: template.description,
        unit: template.unit,
        targetValue: template.targetValue
      }));

      // Apply suggested milestones
      const suggestedMilestones: Omit<Milestone, 'id'>[] = template.suggestedMilestones.map(m => ({
        title: m.title,
        targetValue: m.targetValue,
        targetDate: new Date(Date.now() + m.daysFromNow * 24 * 60 * 60 * 1000),
        isCompleted: false
      }));
      setMilestones(suggestedMilestones);
    }
  };

  const addMilestone = (): void => {
    if (newMilestone.title && newMilestone.targetValue > 0 && newMilestone.targetDate) {
      setMilestones(prev => [...prev, {
        title: newMilestone.title,
        targetValue: newMilestone.targetValue,
        targetDate: new Date(newMilestone.targetDate),
        isCompleted: false
      }]);
      setNewMilestone({ title: '', targetValue: 0, targetDate: '' });
    }
  };

  const removeMilestone = (index: number): void => {
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (validateStep(1) && validateStep(2)) {
      const milestonesWithIds: Milestone[] = milestones.map((milestone, index) => ({
        ...milestone,
        id: `milestone-${Date.now()}-${index}`,
        targetDate: new Date(milestone.targetDate)
      }));

      onCreateGoal({
        ...formData,
        deadline: new Date(formData.deadline),
        milestones: milestonesWithIds
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: GoalCategory.SELFCARE,
        targetValue: 0,
        currentValue: 0,
        unit: '',
        deadline: '',
        priority: GoalPriority.MEDIUM,
        status: GoalStatus.ACTIVE
      });
      setMilestones([]);
      setStep(1);
      setErrors({});
      onClose();
    }
  };

  // Helper function to format category display name
  const formatCategoryName = (category: GoalCategory): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  // Helper function to format priority display name
  const formatPriorityName = (priority: GoalPriority): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
              <p className="text-sm text-gray-600">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const category = e.target.value as GoalCategory;
                    setFormData(prev => ({ ...prev, category }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.values(GoalCategory).map(category => (
                    <option key={category} value={category}>
                      {formatCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Suggestions */}
              {goalTemplates[formData.category] && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Suggested Template</span>
                  </div>
                  <p className="text-sm text-purple-600 mb-3">
                    {goalTemplates[formData.category]!.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => applyTemplate(formData.category)}
                    className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} 
                             rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="e.g., Improve daily mood score"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} 
                             rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Describe what you want to achieve and why it matters"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Value *
                  </label>
                  <input
                    type="number"
                    value={formData.targetValue || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetValue: Number(e.target.value) || 0 }))}
                    className={`w-full border ${errors.targetValue ? 'border-red-300' : 'border-gray-300'} 
                               rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="100"
                    min="0.1"
                    step="0.1"
                  />
                  {errors.targetValue && <p className="text-red-500 text-xs mt-1">{errors.targetValue}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className={`w-full border ${errors.unit ? 'border-red-300' : 'border-gray-300'} 
                               rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="points, sessions, days"
                  />
                  {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Value
                </label>
                <input
                  type="number"
                  value={formData.currentValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentValue: Number(e.target.value) || 0 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          )}

          {/* Step 2: Timeline & Priority */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className={`w-full border ${errors.deadline ? 'border-red-300' : 'border-gray-300'} 
                               rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as GoalPriority }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {Object.values(GoalPriority).map(priority => (
                      <option key={priority} value={priority}>
                        {formatPriorityName(priority)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Milestones */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Milestones (Optional)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Break your goal into smaller, achievable milestones to track progress
                </p>

                {/* Existing Milestones */}
                {milestones.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{milestone.title}</p>
                          <p className="text-xs text-gray-600">
                            {milestone.targetValue} {formData.unit} by {new Date(milestone.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Milestone */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Milestone title"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm 
                               focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={newMilestone.targetValue || ''}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, targetValue: Number(e.target.value) || 0 }))}
                      placeholder={`Target (${formData.unit})`}
                      className="border border-gray-300 rounded px-3 py-2 text-sm 
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      step="0.1"
                    />
                    <input
                      type="date"
                      value={newMilestone.targetDate}
                      onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="border border-gray-300 rounded px-3 py-2 text-sm 
                                 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                      max={formData.deadline}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addMilestone}
                    disabled={!newMilestone.title || newMilestone.targetValue <= 0 || !newMilestone.targetDate}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded text-sm 
                               hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Milestone
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg 
                           hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 
                           text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                <span>Next</span>
                <Zap size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 
                           text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                <Flag size={16} />
                <span>Create Goal</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalModal;