import axios, { AxiosError, CancelTokenSource } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
})

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: { message?: string } | string }>
    if (axiosError.response) {
      const detail = axiosError.response.data?.detail
      if (typeof detail === 'string') {
        return detail
      }
      if (detail && typeof detail === 'object' && 'message' in detail) {
        return detail.message || 'An error occurred'
      }
      return axiosError.response.data?.detail as string || axiosError.message || 'An error occurred'
    }
    if (axiosError.code === 'ECONNABORTED') {
      return 'Request timeout: The server took too long to respond. Please try again.'
    }
    if (axiosError.code === 'ERR_NETWORK') {
      return 'Network error: Unable to connect to the server. Please check your connection.'
    }
    return axiosError.message || 'An error occurred'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export interface WeatherRequest {
  latitude: number
  longitude: number
  start_date: string
  end_date: string
}

export interface WeatherResponse {
  status: string
  file?: string
  message?: string
}

export interface FileInfo {
  name: string
  size: number
  created_at?: string
}

export interface FileListResponse {
  files: FileInfo[]
}

// Custom error class for cancelled requests
export class CancelledRequestError extends Error {
  constructor() {
    super('Request cancelled')
    this.name = 'CancelledRequestError'
  }
}

export const weatherAPI = {
  storeWeatherData: async (data: WeatherRequest, cancelToken?: CancelTokenSource): Promise<WeatherResponse> => {
    try {
      const response = await api.post<WeatherResponse>('/store-weather-data', data, {
        cancelToken: cancelToken?.token,
      })
      return response.data
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new CancelledRequestError()
      }
      throw error
    }
  },

  listWeatherFiles: async (cancelToken?: CancelTokenSource): Promise<FileListResponse> => {
    try {
      const response = await api.get<FileListResponse>('/list-weather-files', {
        cancelToken: cancelToken?.token,
      })
      // Ensure files is always an array
      return {
        files: Array.isArray(response.data?.files) ? response.data.files : []
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new CancelledRequestError()
      }
      throw error
    }
  },

  getWeatherFileContent: async (fileName: string, cancelToken?: CancelTokenSource): Promise<any> => {
    try {
      const response = await api.get(`/weather-file-content/${encodeURIComponent(fileName)}`, {
        cancelToken: cancelToken?.token,
      })
      return response.data
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new CancelledRequestError()
      }
      throw error
    }
  },
}

