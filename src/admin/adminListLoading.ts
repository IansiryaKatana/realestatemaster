/** Only block the whole screen on the first load — keep inputs mounted during refetch. */
export function adminShowInitialLoading(loading: boolean, rowCount: number) {
  return loading && rowCount === 0
}
