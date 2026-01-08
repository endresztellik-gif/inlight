/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching product names in Excel import
 *
 * @param s1 First string
 * @param s2 Second string
 * @returns Levenshtein distance (number of edits needed)
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length
  const len2 = s2.length

  // Create a 2D array for dynamic programming
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0))

  // Initialize first column (deletion costs)
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i
  }

  // Initialize first row (insertion costs)
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate similarity ratio between two strings (0-1 scale)
 * 1.0 = identical, 0.0 = completely different
 *
 * @param s1 First string
 * @param s2 Second string
 * @returns Similarity ratio (0-1)
 *
 * @example
 * calculateSimilarity('ARRI Alexa Mini', 'ARRI ALEXA MINI') // 0.95
 * calculateSimilarity('Canon EOS', 'Nikon Z9') // 0.30
 */
export function calculateSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0
  if (s1.length === 0 && s2.length === 0) return 1.0
  if (s1.length === 0 || s2.length === 0) return 0.0

  const distance = levenshteinDistance(s1, s2)
  const maxLength = Math.max(s1.length, s2.length)

  return 1 - (distance / maxLength)
}

/**
 * Check if two strings are similar enough (above threshold)
 *
 * @param s1 First string
 * @param s2 Second string
 * @param threshold Minimum similarity (0-1), default 0.8
 * @returns True if similarity >= threshold
 */
export function isSimilar(
  s1: string,
  s2: string,
  threshold: number = 0.8
): boolean {
  return calculateSimilarity(s1, s2) >= threshold
}
