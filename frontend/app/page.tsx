'use client'

import { useState } from 'react'
import WeatherInputPanel from '@/components/WeatherInputPanel'
import WeatherFileList from '@/components/WeatherFileList'
import WeatherVisualization from '@/components/WeatherVisualization'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleFileStored = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    setTimeout(() => {
      const element = document.getElementById('visualization')
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 relative overflow-hidden">
      {/* Vibrant Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/40 via-rose-400/40 to-orange-400/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/40 via-indigo-400/40 to-blue-400/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-cyan-400/30 via-blue-400/30 to-violet-400/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Animated Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.1)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Premium Header */}
        <header className="mb-12 lg:mb-16 animate-fade-in">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-md rounded-full shadow-soft border border-white/20 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Live & Ready</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight">
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient drop-shadow-lg">
                Weather Explorer
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed">
              Discover, Store & Visualize Historical Weather Data with Enterprise-Grade Analytics
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">Powered by Open-Meteo API</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">Secure Cloud Storage</span>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Card Grid - Perfect Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12 lg:items-stretch">
          {/* Fetch & Store Card - Vibrant Design */}
          <div className="group relative flex">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition duration-300 animate-pulse"></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-pink-200/50 p-6 sm:p-8 lg:p-10 hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:scale-[1.01] transition-all duration-500 animate-slide-up flex flex-col w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 rounded-2xl blur-xl opacity-70 animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Fetch & Store Data
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Retrieve historical weather data</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <WeatherInputPanel onFileStored={handleFileStored} />
              </div>
            </div>
          </div>

          {/* Stored Files Card - Vibrant Design */}
          <div className="group relative flex">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition duration-300 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-purple-200/50 p-6 sm:p-8 lg:p-10 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-[1.01] transition-all duration-500 animate-slide-up flex flex-col w-full" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 rounded-2xl blur-xl opacity-70 animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Stored Files
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your weather data archive</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <WeatherFileList 
                  refreshTrigger={refreshTrigger}
                  onFileSelect={handleFileSelect}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Card - Vibrant Design */}
        {selectedFile && (
          <div 
            id="visualization"
            className="group relative animate-scale-in"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition duration-300 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-cyan-200/50 p-6 sm:p-8 lg:p-10 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-[1.005] transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-70 animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Weather Visualization
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Advanced analytics & insights</p>
                </div>
              </div>
              <WeatherVisualization fileName={selectedFile} />
            </div>
          </div>
        )}

        {/* Premium Footer */}
        <footer className="mt-16 lg:mt-20 pt-8 border-t border-gray-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">Built with modern technologies</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>for</span>
              <span className="font-semibold text-gray-600">InRisk Labs</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
