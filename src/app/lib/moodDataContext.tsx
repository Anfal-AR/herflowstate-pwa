import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface MoodEntry {
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

export interface MoodDataContextType {
  entries: MoodEntry[];
  addEntry: (entry: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, entry: Partial<MoodEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesInRange: (startDate: string, endDate: string) => MoodEntry[];
  isLoading: boolean;
  error: string | null;
}

// Context
const MoodDataContext = createContext<MoodDataContextType | undefined>(undefined);

// Provider Component
export const MoodDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount (in production, this would be API calls)
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // In production, replace this with API call
      const savedData = localStorage.getItem('herflowstate-mood-entries');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setEntries(parsedData);
      } else {
        // Initialize with sample data for development
        const sampleData = generateSampleData();
        setEntries(sampleData);
        localStorage.setItem('herflowstate-mood-entries', JSON.stringify(sampleData));
      }
    } catch (err) {
      setError('Failed to load mood data');
      console.error('Error loading mood data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = (newEntries: MoodEntry[]) => {
    try {
      localStorage.setItem('herflowstate-mood-entries', JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (err) {
      setError('Failed to save mood data');
      console.error('Error saving mood data:', err);
    }
  };

  const addEntry = (entryData: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: MoodEntry = {
      ...entryData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedEntries = [...entries, newEntry].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    saveData(updatedEntries);
  };

  const updateEntry = (id: string, updateData: Partial<MoodEntry>) => {
    const updatedEntries = entries.map(entry =>
      entry.id === id
        ? { ...entry, ...updateData, updatedAt: new Date().toISOString() }
        : entry
    );
    
    saveData(updatedEntries);
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveData(updatedEntries);
  };

  const getEntriesInRange = (startDate: string, endDate: string): MoodEntry[] => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return entryDate >= start && entryDate <= end;
    });
  };

  // Helper function to generate sample data for development
  const generateSampleData = (): MoodEntry[] => {
    const data: MoodEntry[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Create realistic patterns in the data
      const weekday = date.getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      const sleepBase = isWeekend ? 8 : 7;
      const moodTrend = i * 0.02; // Slight improvement over time
      
      data.push({
        id: generateId(),
        date: date.toISOString().split('T')[0],
        mood: Math.max(1, Math.min(10, 5.5 + Math.random() * 2 + moodTrend)),
        energy: Math.max(1, Math.min(10, 6 + Math.random() * 2 + (isWeekend ? 0.5 : -0.5))),
        sleep: Math.max(4, Math.min(12, sleepBase + (Math.random() - 0.5) * 2)),
        exercise: Math.random() > (isWeekend ? 0.3 : 0.6),
        hydration: Math.max(4, Math.min(12, 7 + Math.random() * 3)),
        stress: Math.max(1, Math.min(10, 4 + Math.random() * 3 + (isWeekend ? -1 : 1))),
        notes: i % 5 === 0 ? 'Sample note for analysis' : undefined,
        tags: i % 7 === 0 ? ['work-stress', 'tired'] : undefined,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    }
    return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const contextValue: MoodDataContextType = {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesInRange,
    isLoading,
    error,
  };

  return (
    <MoodDataContext.Provider value={contextValue}>
      {children}
    </MoodDataContext.Provider>
  );
};

// Custom hook to use the context
export const useMoodData = (): MoodDataContextType => {
  const context = useContext(MoodDataContext);
  if (context === undefined) {
    throw new Error('useMoodData must be used within a MoodDataProvider');
  }
  return context;
};

// Additional utility hooks
export const useMoodAnalytics = () => {
  const { entries, getEntriesInRange } = useMoodData();

  const getRecentEntries = (days: number = 7) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return getEntriesInRange(startDate.toISOString().split('T')[0], endDate);
  };

  const calculateAverage = (entries: MoodEntry[], field: keyof MoodEntry): number => {
    if (entries.length === 0) return 0;
    const numericEntries = entries.filter(entry => typeof entry[field] === 'number');
    if (numericEntries.length === 0) return 0;
    const sum = numericEntries.reduce((acc, entry) => acc + (entry[field] as number), 0);
    return sum / numericEntries.length;
  };

  const getTrend = (entries: MoodEntry[], field: keyof MoodEntry): 'improving' | 'declining' | 'stable' => {
    if (entries.length < 6) return 'stable';
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const midPoint = Math.floor(sortedEntries.length / 2);
    const firstHalf = sortedEntries.slice(0, midPoint);
    const secondHalf = sortedEntries.slice(midPoint);
    
    const firstAvg = calculateAverage(firstHalf, field);
    const secondAvg = calculateAverage(secondHalf, field);
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  };

  return {
    entries,
    getRecentEntries,
    calculateAverage,
    getTrend,
    getEntriesInRange,
  };
};

export default MoodDataContext;