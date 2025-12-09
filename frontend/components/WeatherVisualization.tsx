'use client'

import { useState, useEffect, useRef } from 'react'
import axios, { CancelTokenSource } from 'axios'
import { weatherAPI, getErrorMessage, CancelledRequestError } from '@/lib/api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface WeatherVisualizationProps {
  fileName: string
}

interface WeatherData {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    apparent_temperature_max: number[]
    apparent_temperature_min: number[]
  }
}

interface ChartDataPoint {
  date: string
  maxTemp: number
  minTemp: number
  apparentMax: number
  apparentMin: number
}

export default function WeatherVisualization({ fileName }: WeatherVisualizationProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(!!fileName) // Start with loading=true if fileName exists
  const [error, setError] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const cancelTokenRef = useRef<CancelTokenSource | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted')
      }
    }
  }, [])

  useEffect(() => {
    // Reset state immediately when fileName changes (synchronous)
    if (fileName) {
      setLoading(true)
      setError(null)
      setData([])
    } else {
      setData([])
      setError(null)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      // Cancel any previous request
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('New request initiated')
      }

      // Create new cancel token
      cancelTokenRef.current = axios.CancelToken.source()

      try {
        const weatherData: WeatherData = await weatherAPI.getWeatherFileContent(fileName, cancelTokenRef.current)
        
        if (weatherData.daily && weatherData.daily.time) {
          const chartData: ChartDataPoint[] = weatherData.daily.time.map((date, index) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            maxTemp: weatherData.daily.temperature_2m_max[index],
            minTemp: weatherData.daily.temperature_2m_min[index],
            apparentMax: weatherData.daily.apparent_temperature_max[index],
            apparentMin: weatherData.daily.apparent_temperature_min[index],
          }))
          setData(chartData)
        } else {
          setError('Invalid weather data format: Missing daily data')
        }
      } catch (err: any) {
        // Don't show error if request was cancelled
        if (axios.isCancel(err) || err instanceof CancelledRequestError) {
          return
        }
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
        cancelTokenRef.current = null
      }
    }

    // Use setTimeout to ensure loading state is rendered before async call
    // This ensures the loading UI is visible even on fast networks
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Effect cleanup')
      }
    }
  }, [fileName])

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)

  const stats = data.length > 0 ? {
    avgMax: (data.reduce((sum, d) => sum + d.maxTemp, 0) / data.length).toFixed(1),
    avgMin: (data.reduce((sum, d) => sum + d.minTemp, 0) / data.length).toFixed(1),
    highest: Math.max(...data.map(d => d.maxTemp)).toFixed(1),
    lowest: Math.min(...data.map(d => d.minTemp)).toFixed(1),
  } : null

  if (loading) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl border-2 border-blue-200 shadow-xl">
            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping"></div>
            <svg className="relative animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <p className="text-gray-700 font-bold text-base sm:text-lg mb-2">Loading weather data...</p>
        <p className="text-sm text-gray-500">Fetching and processing data</p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl animate-slide-up shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-red-900 font-bold text-sm">Error</p>
            <p className="text-red-700 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl mb-4 border border-gray-200">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-600 font-semibold">No data available</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 sm:p-4 border-2 border-gray-200 rounded-xl shadow-large max-w-[90vw] sm:max-w-none">
          <p className="font-bold text-gray-900 mb-2 sm:mb-2.5 text-xs sm:text-sm">{payload[0].payload.date}</p>
          <div className="space-y-1 sm:space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs font-medium text-gray-600 truncate">{entry.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-900 flex-shrink-0">{entry.value.toFixed(1)}°C</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Vibrant Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="group relative overflow-hidden bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-pink-300/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-400/50 to-rose-400/50 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative">
              <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg shadow-lg">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-pink-700 uppercase tracking-wider">Highest</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">{stats.highest}°C</p>
            </div>
          </div>
          <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-cyan-300/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400/50 to-blue-400/50 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="relative">
              <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg shadow-lg">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Avg Max</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{stats.avgMax}°C</p>
            </div>
          </div>
          <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-violet-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-indigo-300/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-400/50 to-purple-400/50 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="relative">
              <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-lg">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Avg Min</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.avgMin}°C</p>
            </div>
          </div>
          <div className="group relative overflow-hidden bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 border-2 border-violet-300/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-400/50 to-fuchsia-400/50 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            <div className="relative">
              <div className="flex items-center gap-1.5 sm:gap-2.5 mb-1 sm:mb-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg shadow-lg">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Lowest</p>
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{stats.lowest}°C</p>
            </div>
          </div>
        </div>
      )}

      {/* Vibrant Chart Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-blue-200/50 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="relative flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-2.5">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl shadow-lg transform hover:scale-110 transition-transform">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="hidden sm:inline">Temperature Trends</span>
            <span className="sm:hidden">Trends</span>
          </h3>
        </div>
        <div className="w-full h-64 sm:h-80 lg:h-96 touch-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={60}
                stroke="#6b7280"
                style={{ fontSize: '10px', fontWeight: '500' }}
                tick={{ fill: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '11px', fontWeight: '600', fill: '#374151' } }}
                stroke="#6b7280"
                style={{ fontSize: '10px', fontWeight: '500' }}
                tick={{ fill: '#6b7280' }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                iconSize={16}
                formatter={(value) => <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{value}</span>}
              />
              <Line 
                type="monotone" 
                dataKey="maxTemp" 
                stroke="#3b82f6" 
                name="Max Temperature"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 7, fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="minTemp" 
                stroke="#60a5fa" 
                name="Min Temperature"
                strokeWidth={3}
                dot={{ r: 4, fill: '#60a5fa' }}
                activeDot={{ r: 7, fill: '#60a5fa' }}
              />
              <Line 
                type="monotone" 
                dataKey="apparentMax" 
                stroke="#ef4444" 
                name="Apparent Max"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#ef4444' }}
                activeDot={{ r: 6, fill: '#ef4444' }}
              />
              <Line 
                type="monotone" 
                dataKey="apparentMin" 
                stroke="#f87171" 
                name="Apparent Min"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#f87171' }}
                activeDot={{ r: 6, fill: '#f87171' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Premium Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200/50 shadow-soft overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-3 sm:mb-0 flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            Daily Weather Data
          </h3>
          <div className="flex items-center gap-3">
            <label htmlFor="pageSize" className="text-sm font-semibold text-gray-700">
              Rows:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-3.5 py-2 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-soft"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-6 sm:px-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                <tr>
                  {['Date', 'Max Temp (°C)', 'Min Temp (°C)', 'Apparent Max (°C)', 'Apparent Min (°C)'].map((header) => (
                    <th key={header} className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800">
                        {row.maxTemp.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-bold bg-cyan-100 text-cyan-800">
                        {row.minTemp.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-800">
                        {row.apparentMax.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-bold bg-pink-100 text-pink-800">
                        {row.apparentMin.toFixed(1)}°C
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Premium Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-200">
          <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-0 text-center sm:text-left">
            Showing <span className="text-gray-900">{startIndex + 1}</span> to{' '}
            <span className="text-gray-900">{Math.min(endIndex, data.length)}</span> of{' '}
            <span className="text-gray-900">{data.length}</span> entries
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft hover:shadow-medium flex-1 sm:flex-none"
            >
              Previous
            </button>
            <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-soft whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft hover:shadow-medium flex-1 sm:flex-none"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
