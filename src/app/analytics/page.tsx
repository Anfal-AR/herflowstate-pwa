'use client'

import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl px-6 py-4 flex justify-between items-center shadow-lg">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            ✨ HerFlowState ✨
          </Link>
          <Link href="/" className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-sm hover:shadow-lg transition-all duration-300">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 shadow-xl text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl">
            📊
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Data Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Visualize patterns and insights in your wellness journey
          </p>
        </div>

        {/* Analytics Content */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-purple-600">Wellness Metrics</h3>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Daily Goal Completion</span>
                  <span className="text-purple-600 font-bold">85%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full w-4/5"></div>
                </div>
              </div>
              <div className="bg-pink-50 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Mood Score Average</span>
                  <span className="text-pink-600 font-bold">7.2/10</span>
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2 mt-2">
                  <div className="bg-pink-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-indigo-600">Weekly Trends</h3>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-gray-600">Advanced analytics coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">
                Integration with data visualization libraries in development
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}