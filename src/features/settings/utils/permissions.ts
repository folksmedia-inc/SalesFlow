import { PERMISSION_ACTIONS, PERMISSION_MODULES, type PermissionAction, type PermissionMatrix, type PermissionModule } from '@/types/models'

/** A matrix with no access to any module (used for new roles). */
export function emptyPermissionMatrix(): PermissionMatrix {
  return Object.fromEntries(PERMISSION_MODULES.map((module) => [module, []])) as unknown as PermissionMatrix
}

/** Keeps actions in canonical order (View, Create, Edit, Delete, Export). */
function normalize(actions: Iterable<PermissionAction>): PermissionAction[] {
  const set = new Set(actions)
  return PERMISSION_ACTIONS.filter((action) => set.has(action))
}

/**
 * Grants or revokes one action. Any action other than View implies View;
 * revoking View revokes everything else in that module.
 */
export function togglePermission(matrix: PermissionMatrix, module: PermissionModule, action: PermissionAction, granted: boolean): PermissionMatrix {
  const current = matrix[module] ?? []
  let next: PermissionAction[]
  if (granted) next = normalize([...current, action, 'View'])
  else next = action === 'View' ? [] : normalize(current.filter((item) => item !== action))
  return { ...matrix, [module]: next }
}

/** Grants every action on a module, or revokes them all. */
export function toggleModule(matrix: PermissionMatrix, module: PermissionModule, granted: boolean): PermissionMatrix {
  return { ...matrix, [module]: granted ? [...PERMISSION_ACTIONS] : [] }
}

/** Grants or revokes one action across every module (same implication rules). */
export function toggleAction(matrix: PermissionMatrix, action: PermissionAction, granted: boolean): PermissionMatrix {
  return PERMISSION_MODULES.reduce((next, module) => togglePermission(next, module, action, granted), matrix)
}

export function hasPermission(matrix: PermissionMatrix, module: PermissionModule, action: PermissionAction): boolean {
  return (matrix[module] ?? []).includes(action)
}

/** Cells that differ between two matrices, as `"Module:Action"` keys. */
export function diffPermissions(a: PermissionMatrix, b: PermissionMatrix): Set<string> {
  const changed = new Set<string>()
  for (const module of PERMISSION_MODULES) {
    for (const action of PERMISSION_ACTIONS) {
      if (hasPermission(a, module, action) !== hasPermission(b, module, action)) changed.add(`${module}:${action}`)
    }
  }
  return changed
}

export function countGranted(matrix: PermissionMatrix): number {
  return PERMISSION_MODULES.reduce((total, module) => total + (matrix[module]?.length ?? 0), 0)
}

export const TOTAL_PERMISSIONS = PERMISSION_MODULES.length * PERMISSION_ACTIONS.length
