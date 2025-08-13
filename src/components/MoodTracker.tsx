'use client'

import { useState } from 'react'
import { ArrowLeft, Heart, Smile, Meh, Frown, Angry } from 'lucide-react'
import Link from 'next/link'
import Navigation from './Navigation'

interface MoodEntry {
  id: string
  mood: string
  intensity: number
  note: string
  timestamp: Date
}

const moodOptions = [
  { icon: Heart, label: 'Amazing', value: 'amazing', color: 'text-pink-500' },
  { icon: Smile, label: 'Good', value: 'good', color: 'text-green-500' },
  { icon: Meh, label: 'Okay', value: 'okay', color: 'text-yellow-500' },
  { icon: Frown, label: 'Low', value: 'low', color: 'text-orange-500' },
  { icon: Angry, label: 'Struggling', value: 'struggling', color: 'text-red-500' },
]

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [note, setNote] = useState('')
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])

  const handleSaveMood = () => {
    if (!selectedMood) return

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      intensity,
      note,
      timestamp: new Date(),
    }

    setMoodEntries(prev => [newEntry, ...prev])
    setSelectedMood('')
    setIntensity(5)
    setNote('')
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mood Tracker</h1>
            <p className="text-gray-600">How are you feeling today?</p>
          </div>
        </div>

        {/* Mood Selection */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Your Mood</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {moodOptions.map(({ icon: Icon, label, value, color }) => (
              <button
                key={value}
                onClick={() => setSelectedMood(value)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105 ${
                  selectedMood === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${color}`} />
                <div className="text-sm font-medium text-gray-700">{label}</div>
              </button>
            ))}
          </div>

          {/* Intensity Slider */}
          {selectedMood && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensity: {intensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              className="input-field resize-none h-24"
            />
          </div>

          <button
            onClick={handleSaveMood}
            disabled={!selectedMood}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Mood Entry
          </button>
        </div>

        {/* Recent Entries */}
        {moodEntries.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Entries</h2>
            <div className="space-y-3">
              {moodEntries.slice(0, 5).map((entry) => {
                const moodOption = moodOptions.find(m => m.value === entry.mood)
                const Icon = moodOption?.icon || Heart
                
                return (
                  <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className={`w-5 h-5 mt-0.5 ${moodOption?.color || 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-800 capitalize">{entry.mood}</span>
                        <span className="text-xs text-gray-500">
                          {entry.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        Intensity: {entry.intensity}/10
                      </div>
                      {entry.note && (
                        <p className="text-sm text-gray-600">{entry.note}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  )
}