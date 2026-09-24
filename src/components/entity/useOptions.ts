import { useLookupOptions } from '@/hooks/useLookups'
import { useRelatedOptions } from '@/hooks/useRelatedOptions'
import type { SelectOption } from '@/types/common'
import type { OptionsSource } from './types'

/** Resolves an `OptionsSource` (static list, lookup collection or `related`) to options. */
export function useOptions(source: OptionsSource | undefined): readonly SelectOption[] {
  const lookupOptions = useLookupOptions(typeof source === 'string' && source !== 'related' ? source : undefined)
  const relatedOptions = useRelatedOptions()
  if (!source) return []
  if (source === 'related') return relatedOptions
  return typeof source === 'string' ? lookupOptions : source
}

export function toOptions<const V extends string>(values: readonly V[]): SelectOption<V>[] {
  return values.map((value) => ({ value, label: value }))
}
