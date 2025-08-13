'use client';

import React, { useState } from 'react';

interface MoodEntry {
  id: string;
  timestamp: Date;
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  activities: string[];
  notes: string;
  correlationFactors: {
    weather: string;
    cycle: string;
    exercise: boolean;
    socialActivity: boolean;
  };
}

interface HeatmapCalendarProps {
  entries: MoodEntry[];
}

interface CalendarDay {
  date: Date;
  day: number;
  mood?: number;
  energy?: number;
  stress?: number;
  sleep?: number;
  hasExercise?: boolean;
  activities?: string[];
  notes?: string;
  isCurrentMonth: boolean;
  isEmpty: boolean;
}

interface MonthStats {
  avgMood: number;
  bestDay: CalendarDay | null;
  worstDay: CalendarDay | null;
  exerciseDays: number;
  totalDays: number;
  moodRange: [number, number];
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ entries }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState<'mood' | 'energy' | 'stress' | 'sleep'>('mood');
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get calendar data for current month
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Add empty days for previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push({
        date: new Date(year, month - 1, day),
        day,
        isCurrentMonth: false,
        isEmpty: true
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEntry = entries.find(entry => 
        entry.timestamp.toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        day,
        mood: dayEntry?.mood,
        energy: dayEntry?.energy,
        stress: dayEntry?.stress,
        sleep: dayEntry?.sleep,
        hasExercise: dayEntry?.correlationFactors.exercise,
        activities: dayEntry?.activities,
        notes: dayEntry?.notes,
        isCurrentMonth: true,
        isEmpty: !dayEntry
      });
    }
    
    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        day,
        isCurrentMonth: false,
        isEmpty: true
      });
    }
    
    return days;
  };

  // Calculate monthly statistics
  const calculateMonthStats = (days: CalendarDay[]): MonthStats => {
    const currentMonthDays = days.filter(d => d.isCurrentMonth && !d.isEmpty);
    
    if (currentMonthDays.length === 0) {
      return {
        avgMood: 0,
        bestDay: null,
        worstDay: null,
        exerciseDays: 0,
        totalDays: 0,
        moodRange: [0, 0]
      };
    }

    const moods = currentMonthDays.map(d => d.mood!).filter(Boolean);
    const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    
    const bestDay = currentMonthDays.reduce((best, day) => 
      !best || (day.mood && day.mood > (best.mood || 0)) ? day : best
    , null as CalendarDay | null);
    
    const worstDay = currentMonthDays.reduce((worst, day) => 
      !worst || (day.mood && day.mood < (worst.mood || 10)) ? day : worst
    , null as CalendarDay | null);

    const exerciseDays = currentMonthDays.filter(d => d.hasExercise).length;
    const moodRange: [number, number] = moods.length > 0 ? 
      [Math.min(...moods), Math.max(...moods)] : [0, 0];

    return {
      avgMood,
      bestDay,
      worstDay,
      exerciseDays,
      totalDays: currentMonthDays.length,
      moodRange
    };
  };

  // Get color intensity for heatmap
  const getIntensityColor = (day: CalendarDay): string => {
    if (day.isEmpty || !day.isCurrentMonth) return 'bg-gray-100';
    
    let value: number | undefined;
    let maxValue: number;
    
    switch (selectedMetric) {
      case 'mood':
        value = day.mood;
        maxValue = 10;
        break;
      case 'energy':
        value = day.energy;
        maxValue = 10;
        break;
      case 'stress':
        value = day.stress;
        maxValue = 10;
        break;
      case 'sleep':
        value = day.sleep;
        maxValue = 12;
        break;
    }
    
    if (!value) return 'bg-gray-200';
    
    const intensity = value / maxValue;
    
    // Color gradients based on metric
    switch (selectedMetric) {
      case 'mood':
        if (intensity >= 0.8) return 'bg-purple-600';
        if (intensity >= 0.6) return 'bg-purple-400';
        if (intensity >= 0.4) return 'bg-purple-300';
        if (intensity >= 0.2) return 'bg-purple-200';
        return 'bg-red-200';
      
      case 'energy':
        if (intensity >= 0.8) return 'bg-blue-600';
        if (intensity >= 0.6) return 'bg-blue-400';
        if (intensity >= 0.4) return 'bg-blue-300';
        if (intensity >= 0.2) return 'bg-blue-200';
        return 'bg-gray-300';
      
      case 'stress':
        // Inverse coloring for stress (lower is better)
        if (intensity <= 0.2) return 'bg-green-600';
        if (intensity <= 0.4) return 'bg-green-400';
        if (intensity <= 0.6) return 'bg-yellow-400';
        if (intensity <= 0.8) return 'bg-orange-400';
        return 'bg-red-600';
      
      case 'sleep':
        // Optimal range around 7-8 hours
        const optimalRange = value >= 6.5 && value <= 8.5;
        if (optimalRange && intensity >= 0.7) return 'bg-green-600';
        if (optimalRange) return 'bg-green-400';
        if (intensity >= 0.6) return 'bg-blue-400';
        if (intensity >= 0.4) return 'bg-blue-300';
        return 'bg-blue-200';
    }
    
    return 'bg-gray-200';
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = generateCalendarDays();
  const monthStats = calculateMonthStats(calendarDays);

  if (entries.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Heatmap</h3>
        <div className="text-center text-gray-500 py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg mb-2">No calendar data available</p>
          <p className="text-sm">Start tracking to see monthly patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-pink-200/50">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Monthly Patterns
        </h3>
        <p className="text-gray-600">Visualize daily patterns and identify trends across the month</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {(['mood', 'energy', 'stress', 'sleep'] as const).map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === metric
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h4 className="text-2xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all text-sm font-medium"
        >
          Today
        </button>
      </div>

      {/* Monthly Statistics */}
      {monthStats.totalDays > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
            <div className="text-sm font-medium text-pink-700 mb-1">Average Mood</div>
            <div className="text-2xl font-bold text-pink-800">
              {monthStats.avgMood.toFixed(1)}/10
            </div>
            <div className="text-sm text-pink-600">
              Range: {monthStats.moodRange[0]}-{monthStats.moodRange[1]}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
            <div className="text-sm font-medium text-green-700 mb-1">Best Day</div>
            <div className="text-2xl font-bold text-green-800">
              {monthStats.bestDay?.day}
            </div>
            <div className="text-sm text-green-600">
              Mood: {monthStats.bestDay?.mood}/10
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
            <div className="text-sm font-medium text-blue-700 mb-1">Exercise Days</div>
            <div className="text-2xl font-bold text-blue-800">
              {monthStats.exerciseDays}
            </div>
            <div className="text-sm text-blue-600">
              of {monthStats.totalDays} days
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
            <div className="text-sm font-medium text-orange-700 mb-1">Data Coverage</div>
            <div className="text-2xl font-bold text-orange-800">
              {Math.round((monthStats.totalDays / new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()) * 100)}%
            </div>
            <div className="text-sm text-orange-600">
              {monthStats.totalDays} entries
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => !day.isEmpty && day.isCurrentMonth ? setSelectedDay(day) : null}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all
                ${getIntensityColor(day)}
                ${day.isCurrentMonth && !day.isEmpty ? 'hover:ring-2 hover:ring-pink-400 cursor-pointer' : 'cursor-default'}
                ${!day.isCurrentMonth ? 'opacity-40' : ''}
                ${day.hasExercise ? 'ring-2 ring-green-400' : ''}
                ${selectedDay === day ? 'ring-2 ring-pink-600 scale-110' : ''}
              `}
              disabled={day.isEmpty || !day.isCurrentMonth}
            >
              <span className={day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}>
                {day.day}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h5 className="font-medium text-gray-800 mb-3">Intensity Scale ({selectedMetric})</h5>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {selectedMetric === 'stress' ? (
                <>
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <div className="w-4 h-4 bg-purple-200 rounded"></div>
                  <div className="w-4 h-4 bg-purple-400 rounded"></div>
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                </>
              )}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {selectedMetric === 'stress' ? 'High → Low' : 'Low → High'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-transparent border-2 border-green-400 rounded"></div>
            <span className="text-sm text-gray-600">Exercise day</span>
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
            <h5 className="font-medium text-gray-800 mb-3">
              {monthNames[selectedDay.date.getMonth()]} {selectedDay.day}, {selectedDay.date.getFullYear()}
            </h5>
            
            <div className="space-y-2 text-sm">
              {selectedDay.mood && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mood:</span>
                  <span className="font-medium text-pink-600">{selectedDay.mood}/10</span>
                </div>
              )}
              
              {selectedDay.energy && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Energy:</span>
                  <span className="font-medium text-blue-600">{selectedDay.energy}/10</span>
                </div>
              )}
              
              {selectedDay.stress && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Stress:</span>
                  <span className="font-medium text-red-600">{selectedDay.stress}/10</span>
                </div>
              )}
              
              {selectedDay.sleep && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sleep:</span>
                  <span className="font-medium text-purple-600">{selectedDay.sleep}h</span>
                </div>
              )}
              
              {selectedDay.hasExercise && (
                <div className="text-green-600 font-medium">✓ Exercise day</div>
              )}
              
              {selectedDay.activities && selectedDay.activities.length > 0 && (
                <div>
                  <span className="text-gray-600 block mb-1">Activities:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDay.activities.map(activity => (
                      <span key={activity} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedDay.notes && (
  		<div>
    		  <span className="text-gray-600 block mb-1">Notes:</span>
    		  <p className="text-gray-800 text-xs italic">&quot;{selectedDay.notes}&quot;</p>
  		</div>
	      )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapCalendar;