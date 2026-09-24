import { STORAGE_PREFIX } from '@/constants/app'

/**
 * Safe, namespaced localStorage access. Every call is wrapped in try/catch
 * because storage can throw (private mode, quota, disabled cookies).
 */
export const storage = {
  get<T>(key: string): T | undefined {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}.${key}`)
      return raw === null ? undefined : (JSON.parse(raw) as T)
    } catch {
      return undefined
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(`${STORAGE_PREFIX}.${key}`, JSON.stringify(value))
    } catch {
      // Persistence is best-effort; the in-memory state remains correct.
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}.${key}`)
    } catch {
      // Ignore — see `set`.
    }
  },
}
