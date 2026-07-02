import { Link, useRouterState } from '@tanstack/react-router'
import { Building2, Calendar, FileText, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useStorefrontAuth } from '@/contexts/StorefrontAuthContext'
import { useAgentAuth } from '@/contexts/AgentAuthContext'

const NAV = [
  { label: 'Dashboard', to: '/agent', icon: LayoutDashboard, exact: true },
  { label: 'Inquiries', to: '/agent/inquiries', icon: FileText },
  { label: 'Viewings', to: '/agent/viewings', icon: Calendar },
  { label: 'Transactions', to: '/agent/transactions', icon: Building2 },
] as const

export function AgentShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { signOut } = useStorefrontAuth()
  const { agent } = useAgentAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f7f4ef]">
      <aside className="hidden w-64 shrink-0 flex-col bg-hero-brown text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs uppercase tracking-widest text-white/60">GW Vacation Homes</p>
          <p className="text-lg font-semibold">Agent Portal</p>
          {agent ? <p className="mt-1 text-sm text-white/75">{agent.name}</p> : null}
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? 'bg-white/15' : 'hover:bg-white/10'}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <button type="button" className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10" onClick={() => void signOut()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#e8e0d4] bg-white px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <p className="text-sm font-semibold">Agent Portal</p>
          <div className="w-5" />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Close menu" />
          <aside className="relative flex h-full w-72 flex-col bg-hero-brown text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <p className="font-semibold">Menu</p>
              <button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
              {NAV.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
