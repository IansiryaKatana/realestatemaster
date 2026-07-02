import { Link } from '@tanstack/react-router'
import { useEffect, useState, type ReactNode } from 'react'
import { AdminPageHeading } from '@/admin/components/AdminPageHeading'
import { AdminTabActionsProvider } from '@/admin/components/AdminTabActionsContext'
import { cn } from '@/lib/utils'

export type AdminTabItem = {
  id: string
  label: string
  content: ReactNode
}

type AdminTabHubProps = {
  title: string
  subtitle?: string
  hubPath: string
  tabs: AdminTabItem[]
  activeTab: string
  notice?: ReactNode
}

export function AdminTabHub({ title, subtitle, hubPath, tabs, activeTab, notice }: AdminTabHubProps) {
  const [tabActions, setTabActions] = useState<ReactNode>(null)
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0]

  useEffect(() => {
    setTabActions(null)
  }, [activeTab])

  return (
    <AdminTabActionsProvider value={{ setActions: setTabActions }}>
      <div className="flex min-h-0 flex-col">
        <AdminPageHeading title={title} subtitle={subtitle} />
        <div className="admin-tab-nav-row mb-6">
          <div className="admin-tab-nav" role="tablist" aria-label={`${title} sections`}>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <Link
                  key={tab.id}
                  to={hubPath}
                  search={{ tab: tab.id }}
                  role="tab"
                  aria-selected={isActive}
                  className={cn('admin-tab-nav-item', isActive && 'admin-tab-nav-item-active')}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
          {tabActions ? <div className="admin-tab-nav-actions">{tabActions}</div> : null}
        </div>
        {notice}
        <div role="tabpanel" className="min-h-0 flex-1">
          {active?.content}
        </div>
      </div>
    </AdminTabActionsProvider>
  )
}
