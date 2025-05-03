/**
 * Convert kebab-case to camelCase (e.g., font-size to fontSize)
 */
export function getCamelCaseFromKebabCase(str: string): string {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}
