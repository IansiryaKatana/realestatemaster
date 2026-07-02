import type { AdminRole } from '@/lib/admin/permissions'
import { canAccessAdminNav, canEditAdmin } from '@/lib/admin/permissions'

export function requireAdminPortalAccess(role: AdminRole | null, isAdmin: boolean): boolean {
  return Boolean(isAdmin && role)
}

export function requireAdminEdit(role: AdminRole | null): boolean {
  return canEditAdmin(role)
}

export function canViewAdminSection(role: AdminRole | null, section: Parameters<typeof canAccessAdminNav>[1]): boolean {
  return canAccessAdminNav(role, section)
}
