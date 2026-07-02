import { tryGetSupabase } from '@/integrations/supabase/client'

type RpcOk<T> = { ok: true } & T
type RpcErr = { ok: false; error: string }

export async function callRpc<T extends Record<string, unknown>>(
  name: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const supabase = tryGetSupabase()
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.rpc(name, args ?? {})
  if (error) throw new Error(error.message)
  const result = data as (RpcOk<T> | RpcErr) | null
  if (!result?.ok) throw new Error((result as RpcErr)?.error ?? `RPC ${name} failed`)
  return result as T
}

export async function callRpcItems<T>(name: string, args?: Record<string, unknown>): Promise<T[]> {
  const result = await callRpc<{ items: T[] }>(name, args)
  return result.items ?? []
}

export async function callRpcOptionalItem<T>(name: string, args?: Record<string, unknown>, key = 'item'): Promise<T | null> {
  const result = await callRpc<Record<string, T | null>>(name, args)
  return (result[key] as T | null) ?? null
}
