const DEFAULT_COLLECTION = ['qr', 'image-compressor', 'password', 'invoice-gen']

function getCollectionKey(userId?: string | number): string {
  return userId ? `kitto_collection_${userId}` : 'kitto_collection_guest'
}

function getFavoritesKey(userId?: string | number): string {
  return userId ? `kitto_favorites_${userId}` : 'kitto_favorites_guest'
}

export function getCollectionTools(userId?: string | number): string[] {
  if (typeof window === 'undefined') return DEFAULT_COLLECTION
  try {
    const key = getCollectionKey(userId)
    const saved = localStorage.getItem(key)
    if (!saved) return DEFAULT_COLLECTION
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : DEFAULT_COLLECTION
  } catch {
    return DEFAULT_COLLECTION
  }
}

export function isToolInCollection(toolId: string, userId?: string | number): boolean {
  return getCollectionTools(userId).includes(toolId)
}

export function toggleCollectionTool(toolId: string, userId?: string | number): boolean {
  const current = getCollectionTools(userId)
  let next: string[]
  let inCollection = false
  if (current.includes(toolId)) {
    next = current.filter((id) => id !== toolId)
    inCollection = false
  } else {
    next = [...current, toolId]
    inCollection = true
  }
  try {
    const key = getCollectionKey(userId)
    localStorage.setItem(key, JSON.stringify(next))
    window.dispatchEvent(new Event('kitto_preferences_changed'))
  } catch (e) {
    console.warn('Failed to save collection tools:', e)
  }
  return inCollection
}

export function getFavoriteTools(userId?: string | number): string[] {
  if (typeof window === 'undefined') return []
  try {
    const key = getFavoritesKey(userId)
    const saved = localStorage.getItem(key)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isToolFavorite(toolId: string, userId?: string | number): boolean {
  return getFavoriteTools(userId).includes(toolId)
}

export function toggleFavoriteTool(toolId: string, userId?: string | number): boolean {
  const current = getFavoriteTools(userId)
  let next: string[]
  let favorite = false
  if (current.includes(toolId)) {
    next = current.filter((id) => id !== toolId)
    favorite = false
  } else {
    next = [...current, toolId]
    favorite = true
  }
  try {
    const key = getFavoritesKey(userId)
    localStorage.setItem(key, JSON.stringify(next))
    window.dispatchEvent(new Event('kitto_preferences_changed'))
  } catch (e) {
    console.warn('Failed to save favorite tools:', e)
  }
  return favorite
}

// Backward-compatible aliases
export const getPinnedTools = getCollectionTools
export const isToolPinned = isToolInCollection
export const togglePinTool = toggleCollectionTool
