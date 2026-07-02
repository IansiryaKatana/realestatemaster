export type AdminRole = 'owner' | 'admin' | 'editor' | 'viewer'

export type AdminNavKey =
  | 'dashboard'
  | 'catalog'
  | 'realEstate'
  | 'homepage'
  | 'content'
  | 'commerce'
  | 'communications'
  | 'tenancy'
  | 'settings'

const NAV_ACCESS: Record<AdminNavKey, AdminRole[]> = {
  dashboard: ['owner', 'admin', 'editor', 'viewer'],
  catalog: ['owner', 'admin', 'editor', 'viewer'],
  realEstate: ['owner', 'admin', 'editor', 'viewer'],
  homepage: ['owner', 'admin', 'editor', 'viewer'],
  content: ['owner', 'admin', 'editor', 'viewer'],
  commerce: ['owner', 'admin', 'viewer'],
  communications: ['owner', 'admin', 'editor', 'viewer'],
  tenancy: ['owner', 'admin', 'viewer'],
  settings: ['owner', 'admin', 'editor', 'viewer'],
}

export function canAccessAdminNav(role: AdminRole | null, key: AdminNavKey): boolean {
  if (!role) return false
  return NAV_ACCESS[key].includes(role)
}

export function canEditAdmin(role: AdminRole | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'editor'
}

export function canManageAdminUsers(role: AdminRole | null): boolean {
  return role === 'owner' || role === 'admin'
}

export function adminRoleLabel(role: AdminRole | null): string {
  switch (role) {
    case 'owner':
      return 'Agency Owner'
    case 'admin':
      return 'Administrator'
    case 'editor':
      return 'Site Editor'
    case 'viewer':
      return 'Viewer'
    default:
      return 'Admin'
  }
}
