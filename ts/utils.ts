/**
 * Escapes HTML special characters to prevent XSS attacks
 * and ensure safe rendering in the DOM.
 * 
 * Time Complexity: O(n) where n is input string length
 * Space Complexity: O(n) for the output string
 * 
 * @param str - Input string to escape
 * @returns Escaped HTML string
 * 
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function escapeHtml(str: string | number | null | undefined): string {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
