'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import axios, { CancelTokenSource } from 'axios'
import { weatherAPI, FileInfo, getErrorMessage, CancelledRequestError } from '@/lib/api'

interface WeatherFileListProps {
  refreshTrigger: number
  onFileSelect: (fileName: string) => void
}

export default function WeatherFileList({ refreshTrigger, onFileSelect }: WeatherFileListProps) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  const INITIAL_VISIBLE = 3 // Show 3 files initially
  const cancelTokenRef = useRef<CancelTokenSource | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted')
      }
    }
  }, [])

  const fetchFiles = async () => {
    // Cancel any previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request initiated')
    }

    // Create new cancel token
    cancelTokenRef.current = axios.CancelToken.source()

    setLoading(true)
    setError(null)
    try {
      const response = await weatherAPI.listWeatherFiles(cancelTokenRef.current)
      // Ensure files is always an array
      setFiles(Array.isArray(response.files) ? response.files : [])
    } catch (err: any) {
      // Don't show error if request was cancelled
      if (axios.isCancel(err) || err instanceof CancelledRequestError) {
        return
      }
      setError(getErrorMessage(err))
      // Set empty array on error to prevent iteration errors
      setFiles([])
    } finally {
      setLoading(false)
      cancelTokenRef.current = null
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [refreshTrigger])

  // Sort files based on selected option
  const sortedFiles = useMemo(() => {
    // Ensure files is always an array
    if (!Array.isArray(files) || files.length === 0) {
      return []
    }
    
    const filesCopy = [...files]
    switch (sortBy) {
      case 'newest':
        return filesCopy.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA // Newest first
        })
      case 'oldest':
        return filesCopy.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateA - dateB // Oldest first
        })
      case 'name':
        return filesCopy.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return filesCopy
    }
  }, [files, sortBy])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const handleFileClick = (fileName: string) => {
    setSelectedFile(fileName)
    onFileSelect(fileName)
  }

  const totalSize = Array.isArray(files) ? files.reduce((sum, f) => sum + (f?.size || 0), 0) : 0
  const hasMoreFiles = Array.isArray(sortedFiles) && sortedFiles.length > INITIAL_VISIBLE

  return (
    <div className="space-y-4 flex flex-col">
      {/* Vibrant Refresh Button */}
      <button
        onClick={fetchFiles}
        disabled={loading}
        className="group relative w-full overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 via-indigo-600 to-blue-600 text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-gradient"
        style={{ backgroundSize: '200% 200%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-violet-700 via-indigo-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative flex items-center justify-center gap-2.5">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Browse Stored Files</span>
            </>
          )}
        </span>
      </button>

      {/* Vibrant Stats Card */}
      {files.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-violet-100 via-indigo-100 to-blue-100 rounded-xl p-3 sm:p-4 border-2 border-purple-300/50 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-2xl"></div>
          <div className="relative grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="text-xs sm:text-sm">📁</span>
                <span className="hidden sm:inline">Total Files</span>
                <span className="sm:hidden">Files</span>
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{files.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
                <span className="text-xs sm:text-sm">💾</span>
                <span className="hidden sm:inline">Total Size</span>
                <span className="sm:hidden">Size</span>
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{formatFileSize(totalSize)}</p>
            </div>
          </div>
        </div>
      )}

          {/* Sort Control */}
          {Array.isArray(files) && files.length > 0 && (
        <div className="flex items-center justify-between gap-3 pb-2">
          <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            Sort:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
            aria-label="Sort files by"
            className="px-2.5 py-1.5 text-xs font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all shadow-soft"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
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

      {/* Enhanced Loading Skeleton */}
      {loading && files.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative overflow-hidden h-20 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
              </div>
              <div className="relative h-full flex items-center gap-3 px-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && !error && (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl mb-4 border border-gray-200">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-600 font-semibold text-sm mb-1">No files stored yet</p>
          <p className="text-xs text-gray-400">Fetch weather data to get started</p>
        </div>
      )}

          {/* File List - Show exactly 3 files, then scrollable */}
          {Array.isArray(files) && files.length > 0 && (
        <div className="relative">
          {/* Fixed height to show exactly 3 files, then scrollable */}
          <div className="relative space-y-2 overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: '280px', minHeight: '280px' }}>
            {/* Loading Overlay for Refresh */}
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl z-20 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-3">
                    <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full border-2 border-purple-200 shadow-lg">
                      <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700">Refreshing files...</p>
                </div>
              </div>
            )}
            {Array.isArray(sortedFiles) && sortedFiles.map((file, index) => (
              <div
                key={file.name}
                onClick={() => handleFileClick(file.name)}
                className={`group relative p-3 sm:p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedFile === file.name
                    ? 'bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 border-2 border-blue-500 shadow-md ring-2 ring-blue-300'
                    : 'bg-white border-2 border-gray-200 hover:border-purple-400 hover:shadow-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg ${
                    selectedFile === file.name 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100 group-hover:bg-purple-100'
                  } transition-colors`}>
                    <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                      selectedFile === file.name 
                        ? 'text-blue-600' 
                        : 'text-gray-600 group-hover:text-purple-600'
                    } transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-gray-900 truncate mb-1">
                      {file.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-gray-50 rounded-md font-medium">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        {formatFileSize(file.size)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-gray-50 rounded-md font-medium">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="hidden sm:inline">{formatDate(file.created_at)}</span>
                        <span className="sm:hidden">{new Date(file.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </span>
                    </div>
                  </div>
                  {selectedFile === file.name && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-md shadow-blue-500/50"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll Indicator - Only show if there are more than 3 files */}
          {hasMoreFiles && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none rounded-b-xl flex items-end justify-center pb-2">
              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>Scroll for more</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
