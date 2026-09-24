import { AutoComplete, type GetRef } from 'antd'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { SEARCH_DEBOUNCE_MS } from '@/constants/app'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useEntityList } from '@/hooks/useEntityData'
import { useLookups } from '@/hooks/useLookups'
import { ENTITY_META } from '@/store/entities/entityMeta'
import type { EntityKey } from '@/store/entities/types'
import styles from './GlobalSearch.module.scss'

const MAX_PER_GROUP = 5
const SEARCHABLE = ['employees', 'customers', 'accounts', 'contacts', 'departments', 'teams', 'tasks'] as const satisfies readonly EntityKey[]

interface SearchResult {
  key: string
  label: string
  description: string
  path: string
}

/** Searches every major collection; ⌘K / Ctrl+K or "/" focuses it. */
export function GlobalSearch() {
  const navigate = useNavigate()
  const lookups = useLookups()
  const inputRef = useRef<GetRef<typeof AutoComplete>>(null)
  const [query, setQuery] = useState('')
  const term = useDebouncedValue(query, SEARCH_DEBOUNCE_MS / 2).trim().toLowerCase()

  const collections = {
    employees: useEntityList('employees'),
    customers: useEntityList('customers'),
    accounts: useEntityList('accounts'),
    contacts: useEntityList('contacts'),
    departments: useEntityList('departments'),
    teams: useEntityList('teams'),
    tasks: useEntityList('tasks'),
  }
  const { employees, customers, accounts, contacts, departments, teams, tasks } = collections

  const options = useMemo(() => {
    if (term.length < 2) return []
    const describe: { [K in (typeof SEARCHABLE)[number]]: (record: (typeof collections)[K][number]) => [string, string] } = {
      employees: (r) => [`${r.firstName} ${r.lastName} ${r.email} ${r.employeeId} ${r.jobTitle}`, `${r.jobTitle} · ${lookups.departmentName(r.departmentId)}`],
      customers: (r) => [`${r.name} ${r.company} ${r.email}`, `${r.company} · ${r.status}`],
      accounts: (r) => [`${r.name} ${r.industry} ${r.website}`, `${r.industry} · ${r.status}`],
      contacts: (r) => [`${r.firstName} ${r.lastName} ${r.email} ${r.jobTitle}`, `${r.jobTitle} · ${lookups.accountName(r.accountId)}`],
      departments: (r) => [`${r.name} ${r.code}`, `${lookups.departmentHeadcount(r.id)} employees · ${r.location}`],
      teams: (r) => [`${r.name} ${r.description}`, `${lookups.departmentName(r.departmentId)} · ${r.memberIds.length} members`],
      tasks: (r) => [`${r.title} ${r.description}`, `${r.status} · ${lookups.employeeName(r.assigneeId)}`],
    }
    const source = { employees, customers, accounts, contacts, departments, teams, tasks }

    return SEARCHABLE.flatMap((key) => {
      const meta = ENTITY_META[key]
      const getName = meta.getName as (record: unknown) => string
      const describeRecord = describe[key] as (record: unknown) => [string, string]
      const results: SearchResult[] = (source[key] as { id: string }[])
        .filter((record) => describeRecord(record)[0].toLowerCase().includes(term))
        .slice(0, MAX_PER_GROUP)
        .map((record) => ({ key: `${key}:${record.id}`, label: getName(record), description: describeRecord(record)[1], path: meta.getPath?.(record.id) ?? '/' }))
      if (results.length === 0) return []
      return [
        {
          label: <span className={styles.groupLabel}>{meta.plural}</span>,
          options: results.map((result) => ({
            value: result.path,
            key: result.key,
            label: (
              <div className={styles.option}>
                <span className={styles.optionLabel}>{result.label}</span>
                <span className={styles.optionDescription}>{result.description}</span>
              </div>
            ),
          })),
        },
      ]
    })
  }, [term, employees, customers, accounts, contacts, departments, teams, tasks, lookups])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.closest('input, textarea, [contenteditable="true"], .ant-select')
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Props are set on AutoComplete itself: passing a custom <Input> child makes
  // antd read `element.ref`, which React 19 warns about.
  return (
    <AutoComplete
      ref={inputRef}
      className={styles.search}
      options={options}
      value={query}
      onChange={setQuery}
      onSelect={(path: string) => {
        navigate(path)
        setQuery('')
        inputRef.current?.blur()
      }}
      aria-label="Search employees, customers, accounts and more"
      placeholder="Search records…"
      prefix={<Search size={16} aria-hidden="true" />}
      suffixIcon={<kbd className={styles.kbd}>⌘K</kbd>}
      showSearch
      allowClear
      notFoundContent={term.length >= 2 ? <span className={styles.empty}>No results for “{query}”</span> : null}
      popupMatchSelectWidth={420}
    />
  )
}
