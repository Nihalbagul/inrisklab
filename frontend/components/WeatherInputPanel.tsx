'use client'

import { useState, useEffect, useRef } from 'react'
import axios, { CancelTokenSource } from 'axios'
import { weatherAPI, WeatherRequest, getErrorMessage, CancelledRequestError } from '@/lib/api'

interface WeatherInputPanelProps {
  onFileStored: () => void
}

export default function WeatherInputPanel({ onFileStored }: WeatherInputPanelProps) {
  const [formData, setFormData] = useState<WeatherRequest>({
    latitude: 0,
    longitude: 0,
    start_date: '',
    end_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const cancelTokenRef = useRef<CancelTokenSource | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Cancel any previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request initiated')
    }

    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source()

    try {
      const response = await weatherAPI.storeWeatherData(formData, cancelTokenRef.current)
      if (response.status === 'ok' && response.file) {
        setSuccess(`File stored successfully: ${response.file}`)
        onFileStored()
        setTimeout(() => {
          setFormData({
            latitude: 0,
            longitude: 0,
            start_date: '',
            end_date: '',
          })
          setSuccess(null)
        }, 3000)
      } else {
        setError(response.message || 'Failed to store weather data')
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value,
    }))
  }

  const quickLocations = [
    { name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.41, flag: '🇩🇪' },
    { name: 'New York', country: 'USA', lat: 40.71, lon: -74.01, flag: '🇺🇸' },
    { name: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69, flag: '🇯🇵' },
    { name: 'London', country: 'UK', lat: 51.51, lon: -0.13, flag: '🇬🇧' },
  ]

  const setQuickLocation = (lat: number, lon: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }))
  }

  const setDefaultDates = () => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)
    
    setFormData(prev => ({
      ...prev,
      start_date: weekAgo.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col h-full justify-between">
      {/* Quick Location Pills */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
          Quick Locations
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickLocations.map((loc) => (
            <button
              key={loc.name}
              type="button"
              onClick={() => setQuickLocation(loc.lat, loc.lon)}
              className="group relative px-3 py-2.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200/50 hover:border-gray-300 hover:shadow-soft active:scale-95"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base">{loc.flag}</span>
                <span className="font-semibold">{loc.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Coordinates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="latitude" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span>Latitude</span>
            <span className="text-xs font-normal text-gray-400">(-90 to 90)</span>
          </label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            value={formData.latitude || ''}
            onChange={handleChange}
            step="any"
            min="-90"
            max="90"
            required
            placeholder="52.52"
            className="w-full px-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 bg-white border-2 border-gray-200 rounded-xl shadow-soft focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="longitude" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span>Longitude</span>
            <span className="text-xs font-normal text-gray-400">(-180 to 180)</span>
          </label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            value={formData.longitude || ''}
            onChange={handleChange}
            step="any"
            min="-180"
            max="180"
            required
            placeholder="13.41"
            className="w-full px-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 bg-white border-2 border-gray-200 rounded-xl shadow-soft focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Date Range Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="start_date" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span>Start Date</span>
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 text-sm font-medium text-gray-900 bg-white border-2 border-gray-200 rounded-xl shadow-soft focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="end_date" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <div className="p-1.5 bg-pink-100 rounded-lg">
              <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span>End Date</span>
            <span className="text-xs font-normal text-gray-400">(max 31 days)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3.5 text-sm font-medium text-gray-900 bg-white border-2 border-gray-200 rounded-xl shadow-soft focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={setDefaultDates}
              className="px-3 sm:px-4 py-3 sm:py-3.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-soft active:scale-95 whitespace-nowrap"
              title="Set last 7 days"
            >
              <span className="hidden sm:inline">Last 7d</span>
              <span className="sm:hidden">7d</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vibrant Submit Button with Enhanced Loading */}
      <button
        type="submit"
        disabled={loading}
        className={`group relative w-full overflow-hidden bg-gradient-to-r from-pink-600 via-rose-600 via-orange-600 to-amber-600 text-white py-4 px-6 rounded-xl font-bold text-base shadow-2xl hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] focus:outline-none focus:ring-4 focus:ring-pink-500/50 transition-all duration-300 transform ${loading ? 'cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'} animate-gradient`}
        style={{ backgroundSize: '200% 200%' }}
      >
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-700 via-rose-700 via-orange-700 to-amber-700 animate-pulse"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-700 via-rose-700 via-orange-700 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative flex items-center justify-center gap-3">
          {loading ? (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-md animate-ping"></div>
                <svg className="relative animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <span className="font-bold">Fetching & Storing Data...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Fetch & Store Data</span>
            </>
          )}
        </span>
      </button>

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl animate-slide-up shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-emerald-900 font-semibold text-sm">Success!</p>
              <p className="text-emerald-700 text-xs mt-0.5">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl animate-slide-up shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-red-900 font-semibold text-sm">Error</p>
              <p className="text-red-700 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
