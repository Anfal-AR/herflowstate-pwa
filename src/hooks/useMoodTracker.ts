// src/hooks/useMoodTracker.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MoodEntry, 
  MoodEntryFormData, 
  WellnessMetrics, 
  AdvancedInsights,
  DataQualityMetric 
} from '@/types/mood-tracker';
import { MoodAnalytics } from '@/lib/mood-analytics';

interface UseMoodTrackerReturn {
  // Data
  entries: MoodEntry[];
  analytics: AdvancedInsights | null;
  wellnessMetrics: WellnessMetrics;
  dataQuality: DataQualityMetric;
  
  // Actions
  addEntry: (formData: MoodEntryFormData) => void;
  updateEntry: (id: string, updates: Partial<MoodEntry>) => void;
  deleteEntry: (id: string) => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  
  // State
  loading: boolean;
  error: string | null;
  hasEntryForToday: boolean;
  streakDays: number;
}

const STORAGE_KEY = 'herflowstate-mood-entries';
const BACKUP_KEY = 'herflowstate-mood-backup';

export const useMoodTracker = (): UseMoodTrackerReturn => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem(STORAGE_KEY);
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries) as MoodEntry[];
        // Validate and sort entries
        const validEntries = parsedEntries
          .filter(entry => entry.id && entry.date && typeof entry.mood === 'number')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEntries(validEntries);
      }
    } catch (err) {
      setError('Failed to load saved data');
      console.error('Error loading mood entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save entries to localStorage whenever entries change
  const saveEntries = useCallback((newEntries: MoodEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
      // Create backup
      localStorage.setItem(BACKUP_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
      setError(null);
    } catch (err) {
      setError('Failed to save data');
      console.error('Error saving mood entries:', err);
    }
  }, []);

  // Add new entry
  const addEntry = useCallback((formData: MoodEntryFormData) => {
    const newEntry: MoodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      ...formData
    };

    const updatedEntries = [...entries, newEntry]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    saveEntries(updatedEntries);
  }, [entries, saveEntries]);

  // Update existing entry
  const updateEntry = useCallback((id: string, updates: Partial<MoodEntry>) => {
    const updatedEntries = entries.map(entry =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    saveEntries(updatedEntries);
  }, [entries, saveEntries]);

  // Delete entry
  const deleteEntry = useCallback((id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
  }, [entries, saveEntries]);

  // Export data as JSON
  const exportData = useCallback(() => {
    const exportObject = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      entries: entries,
      totalEntries: entries.length
    };
    return JSON.stringify(exportObject, null, 2);
  }, [entries]);

  // Import data from JSON
  const importData = useCallback((jsonData: string): boolean => {
    try {
      const importObject = JSON.parse(jsonData);
      
      if (!importObject.entries || !Array.isArray(importObject.entries)) {
        throw new Error('Invalid data format');
      }

      const importedEntries = importObject.entries as MoodEntry[];
      
      // Validate imported entries
      const validEntries = importedEntries.filter(entry =>
        entry.id &&
        entry.date &&
        typeof entry.mood === 'number' &&
        typeof entry.energy === 'number' &&
        typeof entry.stress === 'number'
      );

      if (validEntries.length === 0) {
        throw new Error('No valid entries found in import data');
      }

      // Merge with existing entries, avoiding duplicates
      const existingIds = new Set(entries.map(e => e.id));
      const newEntries = validEntries.filter(e => !existingIds.has(e.id));
      
      const mergedEntries = [...entries, ...newEntries]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      saveEntries(mergedEntries);
      return true;
    } catch (err) {
      setError('Failed to import data: ' + (err as Error).message);
      return false;
    }
  }, [entries, saveEntries]);

  // Memoized analytics calculations
  const analytics = useMemo((): AdvancedInsights | null => {
    if (entries.length < 3) return null;
    
    try {
      const analyticsEngine = new MoodAnalytics(entries);
      return analyticsEngine.generateAdvancedInsights();
    } catch (err) {
      console.error('Error generating analytics:', err);
      return null;
    }
  }, [entries]);

  // Wellness metrics
  const wellnessMetrics = useMemo((): WellnessMetrics => {
    if (entries.length === 0) {
      return {
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        averageSleep: 0,
        averageHydration: 0,
        averageExercise: 0,
        averageNutrition: 0,
        consistencyScore: 0,
        improvementTrend: 'stable'
      };
    }

    const analyticsEngine = new MoodAnalytics(entries);
    return analyticsEngine.calculateWellnessMetrics();
  }, [entries]);

  // Data quality metrics
  const dataQuality = useMemo((): DataQualityMetric => {
    const now = new Date();
    const firstEntryDate = entries.length > 0 
      ? new Date(entries[0].date)
      : now;
    
    const daysSinceFirst = Math.ceil(
      (now.getTime() - firstEntryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const totalPossibleDays = Math.max(1, daysSinceFirst);
    const daysTracked = entries.length;
    
    const completeness = Math.min(100, (daysTracked / totalPossibleDays) * 100);
    
    // Calculate consistency (how regular the tracking is)
    let consistencyScore = 0;
    if (entries.length > 1) {
      const gaps = [];
      for (let i = 1; i < entries.length; i++) {
        const prevDate = new Date(entries[i - 1].date);
        const currDate = new Date(entries[i].date);
        const dayGap = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        gaps.push(dayGap);
      }
      
      const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      consistencyScore = Math.max(0, 100 - (averageGap - 1) * 10); // Penalty for gaps > 1 day
    }
    
    // Calculate depth (entries with notes and factors)
    const entriesWithNotes = entries.filter(e => e.notes && e.notes.trim().length > 0).length;
    const entriesWithFactors = entries.filter(e => e.factors && e.factors.length > 0).length;
    const depth = entries.length > 0 
      ? ((entriesWithNotes + entriesWithFactors) / (entries.length * 2)) * 100
      : 0;
    
    const reliability = (completeness + consistencyScore + depth) / 3;

    return {
      completeness,
      consistency: consistencyScore,
      depth,
      reliability,
      daysTracked,
      totalPossibleDays
    };
  }, [entries]);

  // Check if there's an entry for today
  const hasEntryForToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return entries.some(entry => entry.date === today);
  }, [entries]);

  // Calculate streak days
  const streakDays = useMemo(() => {
    if (entries.length === 0) return 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Sort entries by date descending
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date(today);
    
    // Start from today or yesterday if no entry today
    if (!hasEntryForToday) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (const entry of sortedEntries) {
      const entryDate = entry.date;
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      if (entryDate === expectedDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (new Date(entryDate) < currentDate) {
        break; // Gap found, streak ends
      }
    }

    return streak;
  }, [entries, hasEntryForToday]);

  return {
    // Data
    entries,
    analytics,
    wellnessMetrics,
    dataQuality,
    
    // Actions
    addEntry,
    updateEntry,
    deleteEntry,
    exportData,
    importData,
    
    // State
    loading,
    error,
    hasEntryForToday,
    streakDays
  };
};