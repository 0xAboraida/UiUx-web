export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://abourida-zad-backend.hf.space'

interface FetchOptions extends RequestInit {
  requireAuth?: boolean
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, headers: customHeaders, ...customOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  }

  if (requireAuth) {
    const token = localStorage.getItem('zad_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  try {
    const response = await fetch(url, {
      headers,
      ...customOptions,
    })

    if (!response.ok) {
      let errorMessage = 'حدث خطأ غير متوقع'
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.errors && typeof errorData.errors === 'object') {
          const firstErrorArray = Object.values(errorData.errors)[0] as any
          if (Array.isArray(firstErrorArray) && firstErrorArray.length > 0) {
            errorMessage = firstErrorArray[0]
          } else {
            errorMessage = errorData.title || response.statusText
          }
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else {
          errorMessage = response.statusText
        }
      } catch {
        errorMessage = response.statusText
      }
      throw new Error(errorMessage)
    }

    // Attempt to parse JSON, if it fails or returns 204, return null or text
    const text = await response.text()
    if (!text) return null as any
    try {
      return JSON.parse(text)
    } catch {
      return text as any
    }
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}
