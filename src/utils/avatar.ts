const AVATAR_COLORS = ['#0176d3', '#2e844a', '#8a4fd1', '#dd7a01', '#0b827c', '#ba0517', '#3e62c8', '#b35f00']

/** Stable avatar background color derived from a name. */
export function avatarColor(seed: string): string {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}
