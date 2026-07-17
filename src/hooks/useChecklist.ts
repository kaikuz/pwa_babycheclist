import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Item, ItemCheck, Section } from '../lib/types'

const CACHE_KEY = 'canastilla:checklist'

interface ChecklistData {
  sections: Section[]
  items: Item[]
  checks: Record<string, ItemCheck>
}

function readCache(): ChecklistData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as ChecklistData) : null
  } catch {
    return null
  }
}

export function useChecklist() {
  const { email } = useAuth()
  const toast = useToast()
  // Arranca con la última copia guardada (si existe) y revalida en red
  const [data, setData] = useState<ChecklistData | null>(readCache)
  const [loading, setLoading] = useState<boolean>(() => readCache() === null)
  /** true si estamos enseñando la copia local por falta de red */
  const [stale, setStale] = useState(false)
  const dataRef = useRef(data)
  dataRef.current = data

  const load = useCallback(async () => {
    try {
      const [secRes, itemRes, checkRes] = await Promise.all([
        supabase.from('sections').select('*').order('sort'),
        supabase.from('items').select('*').order('sort').order('created_at'),
        supabase.from('item_checks').select('*'),
      ])
      if (secRes.error || itemRes.error || checkRes.error) throw new Error()
      const checks: Record<string, ItemCheck> = {}
      for (const c of checkRes.data as ItemCheck[]) checks[c.item_id] = c
      const fresh: ChecklistData = {
        sections: secRes.data as Section[],
        items: itemRes.data as Item[],
        checks,
      }
      setData(fresh)
      setStale(false)
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
      } catch {
        // sin espacio en localStorage: solo perdemos la caché de lectura
      }
    } catch {
      // Sin red (o error): deja la copia local a la vista y avisa
      if (dataRef.current) setStale(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const channel = supabase
      .channel('checklist-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'item_checks' },
        () => void load()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        () => void load()
      )
      .subscribe()
    const onOnline = () => void load()
    window.addEventListener('online', onOnline)
    return () => {
      void supabase.removeChannel(channel)
      window.removeEventListener('online', onOnline)
    }
  }, [load])

  /** Marca/desmarca con optimistic UI; revierte si falla la red */
  const toggle = useCallback(
    async (item: Item) => {
      const current = dataRef.current
      if (!current || !email) return
      const existing = current.checks[item.id]

      const removeCheck = () =>
        setData((d) => {
          if (!d) return d
          const checks = { ...d.checks }
          delete checks[item.id]
          return { ...d, checks }
        })
      const putCheck = (check: ItemCheck) =>
        setData((d) =>
          d ? { ...d, checks: { ...d.checks, [item.id]: check } } : d
        )

      if (existing) {
        removeCheck()
        try {
          const { error } = await supabase
            .from('item_checks')
            .delete()
            .eq('item_id', item.id)
          if (error) throw error
        } catch {
          putCheck(existing)
          toast('No se pudo desmarcar. ¿Sin conexión?', 'error')
        }
      } else {
        putCheck({
          item_id: item.id,
          checked_by: email,
          checked_at: new Date().toISOString(),
        })
        try {
          const { error } = await supabase.from('item_checks').insert({
            item_id: item.id,
            checked_by: email,
          })
          if (error) throw error
        } catch {
          removeCheck()
          toast('No se pudo marcar. ¿Sin conexión?', 'error')
        }
      }
    },
    [email, toast]
  )

  const addItem = useCallback(
    async (name: string, sectionId: string, essential: boolean) => {
      if (!email) return false
      try {
        const { error } = await supabase.from('items').insert({
          section_id: sectionId,
          name,
          essential,
          is_custom: true,
          created_by: email,
          sort: 1000, // los custom van al final de su sección
        })
        if (error) throw error
      } catch {
        toast('No se pudo añadir el ítem', 'error')
        return false
      }
      toast('Ítem añadido')
      await load()
      return true
    },
    [email, toast, load]
  )

  const deleteItem = useCallback(
    async (item: Item) => {
      try {
        const { error } = await supabase.from('items').delete().eq('id', item.id)
        if (error) throw error
      } catch {
        toast('No se pudo eliminar', 'error')
        return
      }
      toast('Ítem eliminado')
      await load()
    },
    [toast, load]
  )

  return { data, loading, stale, toggle, addItem, deleteItem }
}
