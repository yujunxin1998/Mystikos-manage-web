export function matchNavItems<T extends { label: string; path: string }>(
  items: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => {
    const path = item.path.replace(/^\//, '').toLowerCase()
    return item.label.toLowerCase().includes(q) || path.includes(q)
  })
}
