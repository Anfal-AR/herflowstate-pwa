'use client'

import Link from 'next/link'

export default function AboutPage() {
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            About HerFlowState
          </h1>
          <p className="text-xl text-gray-600">
            Designed with intention. Built for balance.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 shadow-xl mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Our Mission
          </h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We believe in empowering modern women to optimize their wellness through data-driven insights 
              and intentional self-care practices. Our platform combines the precision of engineering principles 
              with the nurturing aspects of personal wellness.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              HerFlowState transforms your self-care routine into a systematic optimization process, 
              applying chemical engineering methodologies to personal wellness for measurable, sustainable results.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-xl text-center border-t-4 border-pink-500">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl">
              🔬
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Data-Driven</h3>
            <p className="text-gray-600">
              Apply scientific methodologies to personal wellness for measurable and sustainable improvements.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-xl text-center border-t-4 border-purple-500">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
              🎯
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Intentional</h3>
            <p className="text-gray-600">
              Every feature is designed with purpose, helping you make conscious choices about your wellness journey.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-xl text-center border-t-4 border-indigo-500">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
              💪
            </div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Empowering</h3>
            <p className="text-gray-600">
              Built for modern women who build, create, and lead. Tools that grow with your ambitions.
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Built with Modern Technology
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
              <div className="text-3xl mb-3">⚛️</div>
              <h4 className="font-bold text-gray-800">React & Next.js</h4>
              <p className="text-sm text-gray-600 mt-2">Modern, fast, and scalable frontend</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-bold text-gray-800">PWA Ready</h4>
              <p className="text-sm text-gray-600 mt-2">Install and use like a native app</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-pink-50 rounded-2xl border border-indigo-200">
              <div className="text-3xl mb-3">🎨</div>
              <h4 className="font-bold text-gray-800">Tailwind CSS</h4>
              <p className="text-sm text-gray-600 mt-2">Beautiful, responsive design system</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-bold text-gray-800">Data Analytics</h4>
              <p className="text-sm text-gray-600 mt-2">Advanced insights and visualizations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}