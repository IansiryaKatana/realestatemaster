import { useCallback, useState } from 'react'

/** Keeps draft input separate from the value that triggers server refetches. */
export function useAdminAppliedSearch(initial = '') {
  const [search, setSearch] = useState(initial)
  const [appliedSearch, setAppliedSearch] = useState(initial)

  const applySearch = useCallback(() => {
    setAppliedSearch(search.trim())
  }, [search])

  return { search, setSearch, appliedSearch, applySearch }
}

/** Keeps draft filter separate from the value that triggers server refetches. */
export function useAdminAppliedFilter<T>(initial: T) {
  const [filter, setFilter] = useState(initial)
  const [appliedFilter, setAppliedFilter] = useState(initial)

  const applyFilter = useCallback(() => {
    setAppliedFilter(filter)
  }, [filter])

  return { filter, setFilter, appliedFilter, applyFilter }
}
