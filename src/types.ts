/**
 * Marketplace API Types
 * Derived from haex-marketplace database schema
 */

// Publisher
export interface Publisher {
  id: string
  displayName: string
  slug: string
  description: string | null
  website: string | null
  email: string | null
  verified: boolean
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface PublisherSummary {
  displayName: string
  slug: string
  verified: boolean
}

// Category
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sortOrder: number
  createdAt: string
}

export interface CategoryWithCount extends Category {
  extensionCount: number
}

export interface CategorySummary {
  name: string
  slug: string
}

// Extension
export interface Extension {
  id: string
  publisherId: string
  categoryId: string | null
  extensionId: string
  publicKey: string
  name: string
  slug: string
  author: string | null
  shortDescription: string
  description: string
  iconUrl: string | null
  verified: boolean
  totalDownloads: number
  averageRating: number | null
  reviewCount: number
  tags: string[] | null
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

export interface ExtensionListItem {
  id: string
  extensionId: string
  name: string
  slug: string
  shortDescription: string
  iconUrl: string | null
  verified: boolean
  totalDownloads: number
  averageRating: number | null
  reviewCount: number
  tags: string[] | null
  publishedAt: string | null
  publisher: PublisherSummary | null
  category: CategorySummary | null
}

export interface ExtensionVersion {
  id: string
  version: string
  changelog: string | null
  bundleSize: number
  bundleHash: string
  permissions: string[] | null
  minAppVersion: string | null
  maxAppVersion: string | null
  downloads: number
  publishedAt: string | null
}

export interface ExtensionVersionSummary {
  version: string
  changelog: string | null
  bundleSize: number
  permissions: string[] | null
  minAppVersion: string | null
  publishedAt: string | null
}

export interface ExtensionScreenshot {
  id: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export interface ExtensionDetail extends Extension {
  publisher: Publisher | null
  category: Category | null
  screenshots: ExtensionScreenshot[]
  versions: ExtensionVersion[]
  latestVersion: ExtensionVersionSummary | null
}

// Reviews
export interface ExtensionReview {
  id: string
  extensionId: string
  userId: string
  rating: number
  title: string | null
  content: string | null
  createdAt: string
  updatedAt: string
}

// API Response Types
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ListExtensionsResponse {
  extensions: ExtensionListItem[]
  pagination: Pagination
}

export interface ListCategoriesResponse {
  categories: CategoryWithCount[]
}

export interface ListVersionsResponse {
  versions: ExtensionVersion[]
}

export interface ListReviewsResponse {
  reviews: ExtensionReview[]
  pagination: Pagination
}

export interface DownloadResponse {
  downloadUrl: string
  version: string
  bundleSize: number
  bundleHash: string
}

// API Request Types
export interface ListExtensionsParams {
  page?: number
  limit?: number
  category?: string
  search?: string
  tags?: string
  sort?: 'downloads' | 'rating' | 'newest' | 'updated'
  publisher?: string
}

export interface ListReviewsParams {
  page?: number
  limit?: number
}

// Error Types
export interface ApiError {
  error: string
  statusCode?: number
}
