'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, Brain, Zap, Droplets, Activity, Moon, 
  ArrowLeft, Save, Calendar, Target, TrendingUp,
  AlertCircle, CheckCircle, Coffee
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

interface FormData {
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  exercise: boolean;
  hydration: number;
  stress: number;
  notes: string;
  tags: string[];
}

const DailyMoodEntry: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    mood: 5,
    energy: 5,
    sleep: 7,
    exercise: false,
    hydration: 6,
    stress: 5,
    notes: '',
    tags: []
  });

  const [existingEntry, setExistingEntry] = useState<MoodEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for existing entry on date change
  useEffect(() => {
    checkExistingEntry(formData.date);
  }, [formData.date]);

  const checkExistingEntry = (date: string) => {
    try {
      const savedEntries = localStorage.getItem('herflowstate-mood-entries');
      if (savedEntries) {
        const entries: MoodEntry[] = JSON.parse(savedEntries);
        const existing = entries.find(entry => entry.date === date);
        if (existing) {
          setExistingEntry(existing);
          // Pre-populate form with existing data
          setFormData({
            date: existing.date,
            mood: existing.mood,
            energy: existing.energy,
            sleep: existing.sleep,
            exercise: existing.exercise,
            hydration: existing.hydration,
            stress: existing.stress,
            notes: existing.notes || '',
            tags: existing.tags || []
          });
        } else {
          setExistingEntry(null);
          // Reset form for new entry (keep date)
          setFormData(prev => ({
            ...prev,
            mood: 5,
            energy: 5,
            sleep: 7,
            exercise: false,
            hydration: 6,
            stress: 5,
            notes: '',
            tags: []
          }));
        }
      }
    } catch (error) {
      console.error('Error checking existing entry:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.mood < 1 || formData.mood > 10) {
      newErrors.mood = 'Mood must be between 1 and 10';
    }

    if (formData.energy < 1 || formData.energy > 10) {
      newErrors.energy = 'Energy must be between 1 and 10';
    }

    if (formData.sleep < 0 || formData.sleep > 24) {
      newErrors.sleep = 'Sleep hours must be between 0 and 24';
    }

    if (formData.hydration < 0 || formData.hydration > 20) {
      newErrors.hydration = 'Hydration must be between 0 and 20 glasses';
    }

    if (formData.stress < 1 || formData.stress > 10) {
      newErrors.stress = 'Stress must be between 1 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing entries
      const savedEntries = localStorage.getItem('herflowstate-mood-entries');
      let entries: MoodEntry[] = savedEntries ? JSON.parse(savedEntries) : [];

      const entryData: MoodEntry = {
        id: existingEntry?.id || generateId(),
        date: formData.date,
        mood: formData.mood,
        energy: formData.energy,
        sleep: formData.sleep,
        exercise: formData.exercise,
        hydration: formData.hydration,
        stress: formData.stress,
        notes: formData.notes || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        createdAt: existingEntry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingEntry) {
        // Update existing entry
        entries = entries.map(entry => 
          entry.id === existingEntry.id ? entryData : entry
        );
      } else {
        // Add new entry
        entries.push(entryData);
      }

      // Sort entries by date (newest first)
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Save to localStorage
      localStorage.setItem('herflowstate-mood-entries', JSON.stringify(entries));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // If it was a new entry, navigate to next day
      if (!existingEntry) {
        const nextDay = new Date(formData.date);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        
        // Only advance to next day if it's not in the future
        if (nextDayStr <= today) {
          setFormData(prev => ({ ...prev, date: nextDayStr }));
        }
      }

    } catch (error) {
      console.error('Error saving entry:', error);
      setErrors({ submit: 'Failed to save entry. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSliderChange = (field: keyof FormData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😕';
    if (mood <= 6) return '😐';
    if (mood <= 8) return '🙂';
    return '😄';
  };

  const getEnergyColor = (energy: number) => {
    if (energy <= 3) return 'text-red-500';
    if (energy <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStressColor = (stress: number) => {
    if (stress <= 3) return 'text-green-500';
    if (stress <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const commonTags = [
    'work-stress', 'tired', 'productive', 'anxious', 'happy', 
    'social', 'exercise', 'travel', 'sick', 'excited'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        
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
            <h1 className="text-3xl font-bold text-gray-900">Daily Wellness Entry</h1>
            <p className="text-gray-600 mt-2">
              {existingEntry ? 'Update your entry' : 'Track your wellness metrics'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              {new Date(formData.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">
              Entry {existingEntry ? 'updated' : 'saved'} successfully!
            </span>
          </div>
        )}

        {/* Existing Entry Notice */}
        {existingEntry && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800">
              Updating existing entry for {new Date(existingEntry.date).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="space-y-8">
          
          {/* Date Selection */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Date</h2>
            </div>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {errors.date && <p className="mt-2 text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* Mood & Energy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mood */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">Mood</h2>
                <span className="text-2xl ml-auto">{getMoodEmoji(formData.mood)}</span>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mood}
                  onChange={(e) => handleSliderChange('mood', Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Very Low (1)</span>
                  <span className="font-bold text-lg">{formData.mood}/10</span>
                  <span>Excellent (10)</span>
                </div>
              </div>
              {errors.mood && <p className="mt-2 text-sm text-red-600">{errors.mood}</p>}
            </div>

            {/* Energy */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className={`w-5 h-5 ${getEnergyColor(formData.energy)}`} />
                <h2 className="text-lg font-semibold text-gray-900">Energy Level</h2>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy}
                  onChange={(e) => handleSliderChange('energy', Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Exhausted (1)</span>
                  <span className="font-bold text-lg">{formData.energy}/10</span>
                  <span>High Energy (10)</span>
                </div>
              </div>
              {errors.energy && <p className="mt-2 text-sm text-red-600">{errors.energy}</p>}
            </div>
          </div>

          {/* Sleep & Hydration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sleep */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Moon className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Sleep Duration</h2>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={formData.sleep}
                  onChange={(e) => handleSliderChange('sleep', Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-red-200 via-blue-200 to-green-200 rounded-lg appearance-none slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 hours</span>
                  <span className="font-bold text-lg">{formData.sleep}h</span>
                  <span>12 hours</span>
                </div>
              </div>
              {errors.sleep && <p className="mt-2 text-sm text-red-600">{errors.sleep}</p>}
            </div>

            {/* Hydration */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Droplets className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">Hydration</h2>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={formData.hydration}
                  onChange={(e) => handleSliderChange('hydration', Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-red-200 via-blue-200 to-cyan-200 rounded-lg appearance-none slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 glasses</span>
                  <span className="font-bold text-lg">{formData.hydration} glasses</span>
                  <span>15+ glasses</span>
                </div>
              </div>
              {errors.hydration && <p className="mt-2 text-sm text-red-600">{errors.hydration}</p>}
            </div>
          </div>

          {/* Exercise & Stress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Exercise */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Exercise</h2>
              </div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.exercise}
                  onChange={(e) => setFormData(prev => ({ ...prev, exercise: e.target.checked }))}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-gray-700">I exercised today</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">Any physical activity counts!</p>
            </div>

            {/* Stress */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className={`w-5 h-5 ${getStressColor(formData.stress)}`} />
                <h2 className="text-lg font-semibold text-gray-900">Stress Level</h2>
              </div>
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.stress}
                  onChange={(e) => handleSliderChange('stress', Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Very Calm (1)</span>
                  <span className="font-bold text-lg">{formData.stress}/10</span>
                  <span>Very Stressed (10)</span>
                </div>
              </div>
              {errors.stress && <p className="mt-2 text-sm text-red-600">{errors.stress}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
              <span className="text-sm text-gray-500">(Optional)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Coffee className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
              <span className="text-sm text-gray-500">(Optional)</span>
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How was your day? Any insights or observations..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error Messages */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {existingEntry ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {existingEntry ? 'Update Entry' : 'Save Entry'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyMoodEntry;