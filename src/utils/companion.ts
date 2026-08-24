export function parseCompanionTagIds(value: string): number[] {
  const ids = value
    .split(/[,，]/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0)
  return [...new Set(ids)]
}
