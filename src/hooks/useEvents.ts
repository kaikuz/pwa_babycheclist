import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { CalEvent, EventType, Recurrence } from '../lib/types'

const CACHE_KEY = 'canastilla:calendar'

export interface EventInput {
  type_id: string
  title: string
  notes: string | null
  start_date: string
  end_date: string | null
  all_day: boolean
  time: string | null
  recurrence: Recurrence
  recurrence_until: string | null
}

interface CalendarData {
  types: EventType[]
  events: CalEvent[]
}

function readCache(): CalendarData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CalendarData) : null
  } catch {
    return null
  }
}

export function useEvents() {
  const { email } = useAuth()
  const toast = useToast()
  const [data, setData] = useState<CalendarData | null>(readCache)
  const [loading, setLoading] = useState<boolean>(() => readCache() === null)
  const [stale, setStale] = useState(false)
  const dataRef = useRef(data)
  dataRef.current = data

  const load = useCallback(async () => {
    try {
      const [typeRes, evRes] = await Promise.all([
        supabase.from('event_types').select('*').order('id'),
        supabase.from('events').select('*').order('start_date'),
      ])
      if (typeRes.error || evRes.error) throw new Error()
      const fresh: CalendarData = {
        types: typeRes.data as EventType[],
        events: evRes.data as CalEvent[],
      }
      setData(fresh)
      setStale(false)
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(fresh))
      } catch {
        // sin espacio: solo perdemos la caché de lectura
      }
    } catch {
      if (dataRef.current) setStale(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
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

  const setEvents = (fn: (events: CalEvent[]) => CalEvent[]) =>
    setData((d) => (d ? { ...d, events: fn(d.events) } : d))

  /** Crea o edita un evento con optimistic UI; revierte si falla la escritura. */
  const saveEvent = useCallback(
    async (input: EventInput, existing?: CalEvent): Promise<boolean> => {
      if (!email) return false
      const prev = dataRef.current?.events ?? []
      const now = new Date().toISOString()

      if (existing) {
        setEvents((evs) =>
          evs.map((e) =>
            e.id === existing.id ? { ...e, ...input, updated_at: now } : e
          )
        )
        try {
          const { error } = await supabase
            .from('events')
            .update({ ...input, updated_at: now })
            .eq('id', existing.id)
          if (error) throw error
        } catch {
          setEvents(() => prev)
          toast('No se pudo guardar el evento', 'error')
          return false
        }
        toast('Evento actualizado')
      } else {
        const temp: CalEvent = {
          id: crypto.randomUUID(),
          created_by: email,
          created_at: now,
          updated_at: now,
          ...input,
        }
        setEvents((evs) => [...evs, temp])
        try {
          const { error } = await supabase
            .from('events')
            .insert({ ...input, created_by: email })
          if (error) throw error
        } catch {
          setEvents(() => prev)
          toast('No se pudo crear el evento', 'error')
          return false
        }
        toast('Evento añadido')
        await load() // reconcilia el id temporal con el real
      }
      return true
    },
    [email, toast, load]
  )

  const deleteEvent = useCallback(
    async (ev: CalEvent): Promise<boolean> => {
      const prev = dataRef.current?.events ?? []
      setEvents((evs) => evs.filter((e) => e.id !== ev.id))
      try {
        const { error } = await supabase.from('events').delete().eq('id', ev.id)
        if (error) throw error
      } catch {
        setEvents(() => prev)
        toast('No se pudo eliminar', 'error')
        return false
      }
      toast('Evento eliminado')
      return true
    },
    [toast]
  )

  return { data, loading, stale, saveEvent, deleteEvent }
}
