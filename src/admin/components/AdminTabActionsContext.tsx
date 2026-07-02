import { createContext, useContext, useEffect, type DependencyList, type ReactNode } from 'react'

type AdminTabActionsContextValue = {
  setActions: (actions: ReactNode) => void
}

const AdminTabActionsContext = createContext<AdminTabActionsContextValue | null>(null)

export function AdminTabActionsProvider({
  children,
  value,
}: {
  children: ReactNode
  value: AdminTabActionsContextValue
}) {
  return <AdminTabActionsContext.Provider value={value}>{children}</AdminTabActionsContext.Provider>
}

export function useAdminTabActions(actions: ReactNode, deps: DependencyList = []) {
  const context = useContext(AdminTabActionsContext)

  useEffect(() => {
    if (!context) return
    context.setActions(actions)
    return () => context.setActions(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls when actions update
  }, [context, ...deps])
}
