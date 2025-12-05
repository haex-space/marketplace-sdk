/**
 * Vue Composable for Haex Marketplace SDK
 */

import { ref, shallowRef, computed, type Ref, type ComputedRef } from 'vue'
import {
  MarketplaceClient,
  MarketplaceApiError,
  type MarketplaceClientOptions,
} from './client'
import type {
  ListExtensionsParams,
  ListExtensionsResponse,
  ListCategoriesResponse,
  ExtensionDetail,
  DownloadResponse,
  ExtensionVersion,
  CategoryWithCount,
  ExtensionListItem,
} from './types'

export interface UseMarketplaceOptions extends MarketplaceClientOptions {}

export interface UseMarketplaceReturn {
  /** The underlying client instance */
  client: MarketplaceClient
  /** Whether any request is currently loading */
  isLoading: Ref<boolean>
  /** Last error that occurred */
  error: Ref<MarketplaceApiError | Error | null>

  // Extensions
  extensions: Ref<ExtensionListItem[]>
  extensionsTotal: Ref<number>
  currentExtension: Ref<ExtensionDetail | null>
  fetchExtensions: (params?: ListExtensionsParams) => Promise<ListExtensionsResponse>
  fetchExtension: (slug: string) => Promise<ExtensionDetail>

  // Categories
  categories: Ref<CategoryWithCount[]>
  fetchCategories: () => Promise<CategoryWithCount[]>

  // Download
  getDownloadUrl: (slug: string, version?: string) => Promise<DownloadResponse>

  // Versions
  fetchVersions: (slug: string) => Promise<ExtensionVersion[]>

  // Utilities
  clearError: () => void
}

/**
 * Vue composable for the Haex Marketplace API
 */
export function useMarketplace(options?: UseMarketplaceOptions): UseMarketplaceReturn {
  const client = new MarketplaceClient(options)

  const isLoading = ref(false)
  const error = shallowRef<MarketplaceApiError | Error | null>(null)

  // State
  const extensions = ref<ExtensionListItem[]>([])
  const extensionsTotal = ref(0)
  const currentExtension = shallowRef<ExtensionDetail | null>(null)
  const categories = ref<CategoryWithCount[]>([])

  // Helper to wrap async operations
  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    isLoading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Extensions
  async function fetchExtensions(params?: ListExtensionsParams): Promise<ListExtensionsResponse> {
    return withLoading(async () => {
      const response = await client.listExtensions(params)
      extensions.value = response.extensions
      extensionsTotal.value = response.pagination.total
      return response
    })
  }

  async function fetchExtension(slug: string): Promise<ExtensionDetail> {
    return withLoading(async () => {
      const extension = await client.getExtension(slug)
      currentExtension.value = extension
      return extension
    })
  }

  // Categories
  async function fetchCategories(): Promise<CategoryWithCount[]> {
    return withLoading(async () => {
      const response = await client.listCategories()
      categories.value = response.categories
      return response.categories
    })
  }

  // Download
  async function getDownloadUrl(slug: string, version?: string): Promise<DownloadResponse> {
    return withLoading(async () => {
      return client.getDownloadUrl(slug, version)
    })
  }

  // Versions
  async function fetchVersions(slug: string): Promise<ExtensionVersion[]> {
    return withLoading(async () => {
      const response = await client.listVersions(slug)
      return response.versions
    })
  }

  function clearError() {
    error.value = null
  }

  return {
    client,
    isLoading,
    error,
    extensions,
    extensionsTotal,
    currentExtension,
    fetchExtensions,
    fetchExtension,
    categories,
    fetchCategories,
    getDownloadUrl,
    fetchVersions,
    clearError,
  }
}

// Re-export types for convenience
export type {
  ListExtensionsParams,
  ListExtensionsResponse,
  ExtensionDetail,
  ExtensionListItem,
  ExtensionVersion,
  CategoryWithCount,
  DownloadResponse,
} from './types'

export { MarketplaceClient, MarketplaceApiError } from './client'
