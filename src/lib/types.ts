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
