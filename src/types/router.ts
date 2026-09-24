/**
 * Metadata attached to routes via React Router's `handle` property.
 * Used for document titles, breadcrumbs and page headings.
 */
export interface RouteHandle {
  /** Page title (document title and page heading). */
  title: string
  /** Breadcrumb label. Omit to hide the route from breadcrumbs. */
  crumb?: string
  /** Short description shown under the page title. */
  description?: string
}

export function isRouteHandle(value: unknown): value is RouteHandle {
  return typeof value === 'object' && value !== null && 'title' in value
}
