export interface Section {
  id: string
  name: string
  emoji: string
  sort: number
}

export interface Product {
  n: string // nombre
  p: string // precio orientativo
  u: string // url
}

export interface Item {
  id: string
  section_id: string
  name: string
  essential: boolean
  products: Product[]
  is_custom: boolean
  created_by: string | null
  sort: number
  created_at: string
}

export interface ItemCheck {
  item_id: string
  checked_by: string
  checked_at: string
  /** producto elegido al marcar; null = "otro" o ítem sin productos */
  product: string | null
}

export const DOC_CATEGORIES = ['parto', 'medico', 'tramites', 'general'] as const
export type DocCategory = (typeof DOC_CATEGORIES)[number]

export const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
  parto: 'Parto',
  medico: 'Médico',
  tramites: 'Trámites',
  general: 'General',
}

export interface DocumentRow {
  id: string
  title: string
  category: string
  storage_path: string
  uploaded_by: string
  created_at: string
}

export type Filter = 'all' | 'essential' | 'nice' | 'pending'

// --- Calendario ---------------------------------------------------------

export const RECURRENCES = ['none', 'daily', 'weekly'] as const
export type Recurrence = (typeof RECURRENCES)[number]

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  none: 'No se repite',
  daily: 'Diario',
  weekly: 'Semanal',
}

export interface EventType {
  id: string
  name: string
  color: string // hex del modo claro (el oscuro lo resuelve el cliente)
  icon: string
}

export interface CalEvent {
  id: string
  type_id: string
  title: string
  notes: string | null
  start_date: string // 'YYYY-MM-DD'
  end_date: string | null // null = un solo día
  all_day: boolean
  time: string | null // 'HH:MM'
  recurrence: Recurrence
  recurrence_until: string | null
  created_by: string
  created_at: string
  updated_at: string
}
