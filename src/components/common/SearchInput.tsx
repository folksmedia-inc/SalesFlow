import { Input } from 'antd'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SEARCH_DEBOUNCE_MS } from '@/constants/app'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

interface SearchInputProps {
  /** Committed value (usually from the URL). */
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

/** Search box that commits after a short debounce and follows external value changes (e.g. back/forward). */
export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  const [input, setInput] = useState(value)
  const debounced = useDebouncedValue(input, SEARCH_DEBOUNCE_MS)
  const lastSynced = useRef(value)

  useEffect(() => {
    if (debounced !== lastSynced.current) {
      lastSynced.current = debounced
      onChange(debounced)
    }
  }, [debounced, onChange])

  useEffect(() => {
    if (value !== lastSynced.current) {
      lastSynced.current = value
      setInput(value)
    }
  }, [value])

  return (
    <Input
      allowClear
      prefix={<Search size={16} aria-hidden="true" />}
      placeholder={placeholder}
      aria-label={placeholder.replace(/…$/, '')}
      value={input}
      onChange={(event) => setInput(event.target.value)}
      className={className}
    />
  )
}
