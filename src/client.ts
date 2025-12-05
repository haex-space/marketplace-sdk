/**
 * Marketplace API Client
 */

import type {
  ListExtensionsParams,
  ListExtensionsResponse,
  ListCategoriesResponse,
  ListVersionsResponse,
  ListReviewsResponse,
  ListReviewsParams,
  DownloadResponse,
  ExtensionDetail,
  ApiError,
} from './types'

export interface MarketplaceClientOptions {
  baseUrl?: string
  /** Platform identifier (e.g., 'windows', 'macos', 'linux', 'android', 'ios') */
  platform?: string
  /** App version for compatibility checks */
  appVersion?: string
  /** Custom fetch implementation (for SSR or testing) */
  fetch?: typeof fetch
}

const DEFAULT_BASE_URL = 'https://marketplace.haex.space'

export class MarketplaceClient {
  private baseUrl: string
  private platform?: string
  private appVersion?: string
  private fetchFn: typeof fetch

  constructor(options: MarketplaceClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL
    this.platform = options.platform
    this.appVersion = options.appVersion
    this.fetchFn = options.fetch ?? globalThis.fetch
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit & { params?: Record<string, string | number | undefined> }
  ): Promise<T> {
    const { params, ...fetchOptions } = options ?? {}

    let url = `${this.baseUrl}${endpoint}`

    if (params) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      }
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions?.headers as Record<string, string>),
    }

    if (this.platform) {
      headers['X-Platform'] = this.platform
    }
    if (this.appVersion) {
      headers['X-App-Version'] = this.appVersion
    }

    const response = await this.fetchFn(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}`,
      }))
      throw new MarketplaceApiError(
        errorData.error || `HTTP ${response.status}`,
        response.status
      )
    }

    return response.json()
  }

  /**
   * List extensions with optional filtering and pagination
   */
  async listExtensions(params?: ListExtensionsParams): Promise<ListExtensionsResponse> {
    return this.request<ListExtensionsResponse>('/extensions', {
      params: params as Record<string, string | number | undefined>,
    })
  }

  /**
   * Get extension details by slug
   */
  async getExtension(slug: string): Promise<ExtensionDetail> {
    return this.request<ExtensionDetail>(`/extensions/${encodeURIComponent(slug)}`)
  }

  /**
   * Get all categories with extension counts
   */
  async listCategories(): Promise<ListCategoriesResponse> {
    return this.request<ListCategoriesResponse>('/categories')
  }

  /**
   * Get download URL for an extension
   * @param slug Extension slug
   * @param version Optional specific version (defaults to latest)
   */
  async getDownloadUrl(slug: string, version?: string): Promise<DownloadResponse> {
    return this.request<DownloadResponse>(
      `/extensions/${encodeURIComponent(slug)}/download`,
      { params: version ? { version } : undefined }
    )
  }

  /**
   * Get all versions of an extension
   */
  async listVersions(slug: string): Promise<ListVersionsResponse> {
    return this.request<ListVersionsResponse>(
      `/extensions/${encodeURIComponent(slug)}/versions`
    )
  }

  /**
   * Get reviews for an extension
   */
  async listReviews(slug: string, params?: ListReviewsParams): Promise<ListReviewsResponse> {
    return this.request<ListReviewsResponse>(
      `/extensions/${encodeURIComponent(slug)}/reviews`,
      { params: params as Record<string, string | number | undefined> }
    )
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health')
  }
}

/**
 * Custom error class for Marketplace API errors
 */
export class MarketplaceApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'MarketplaceApiError'
  }
}

/**
 * Create a new MarketplaceClient instance
 */
export function createMarketplaceClient(
  options?: MarketplaceClientOptions
): MarketplaceClient {
  return new MarketplaceClient(options)
}
