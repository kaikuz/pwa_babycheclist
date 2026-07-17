import { useRef, useState, type FormEvent } from 'react'
import { useDocuments } from '../hooks/useDocuments'
import { useAuth } from '../context/AuthContext'
import { DocumentsSkeleton } from '../components/Skeletons'
import { displayName, shortDate } from '../lib/format'
import {
  DOC_CATEGORIES,
  DOC_CATEGORY_LABELS,
  type DocCategory,
  type DocumentRow,
} from '../lib/types'

const CATEGORY_ICONS: Record<DocCategory, string> = {
  parto: '🤱',
  medico: '🩺',
  tramites: '📋',
  general: '📄',
}

function categoryIcon(category: string): string {
  return CATEGORY_ICONS[category as DocCategory] ?? '📄'
}

export function DocumentsPage() {
  const { email } = useAuth()
  const { docs, uploading, upload, view, remove } = useDocuments()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<DocCategory>('general')
  const [file, setFile] = useState<File | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim() || uploading) return
    const ok = await upload(file, title.trim(), category)
    if (ok) {
      setTitle('')
      setFile(null)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const confirmDelete = (doc: DocumentRow) => {
    if (confirm(`¿Eliminar «${doc.title}»?`)) void remove(doc)
  }

  if (docs === null) return <DocumentsSkeleton />

  const byCategory = DOC_CATEGORIES.map((c) => ({
    category: c,
    docs: docs.filter((d) => d.category === c),
  })).filter((g) => g.docs.length > 0)

  const inputCls =
    'rounded-[12px] border border-edge bg-page px-3 py-2.5 text-[15px] outline-none focus:border-euca'

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <h1 className="px-1 font-display text-2xl font-semibold">Documentos</h1>

      {/* Subir */}
      <form
        onSubmit={submit}
        className="rounded-card border border-edge bg-card p-4 shadow-card"
      >
        <h2 className="font-display text-lg font-semibold">Subir documento</h2>
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título, p. ej. Plan de parto"
            className={inputCls}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocCategory)}
            className={inputCls}
          >
            {DOC_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_ICONS[c]} {DOC_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-soft file:mr-3 file:rounded-pill file:border-0 file:bg-euca-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-euca"
          />
          <button
            type="submit"
            disabled={!file || !title.trim() || uploading}
            className="rounded-[12px] bg-euca py-2.5 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {uploading ? 'Subiendo…' : 'Subir'}
          </button>
        </div>
      </form>

      {/* Lista */}
      {docs.length === 0 ? (
        <div className="rounded-card border border-dashed border-edge px-6 py-10 text-center">
          <p className="text-3xl">🗂️</p>
          <p className="mt-3 font-semibold">Aún no hay documentos</p>
          <p className="mt-1 text-sm text-soft">
            Sube aquí el plan de parto, informes médicos o papeles de trámites.
          </p>
        </div>
      ) : (
        byCategory.map((group) => (
          <section key={group.category}>
            <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-wide text-soft">
              {DOC_CATEGORY_LABELS[group.category]}
            </h2>
            <ul className="overflow-hidden rounded-card border border-edge bg-card shadow-card">
              {group.docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 border-b border-edge px-4 py-3 last:border-b-0"
                >
                  <span className="text-2xl">{categoryIcon(doc.category)}</span>
                  <button
                    onClick={() => void view(doc)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-[15px] font-medium">{doc.title}</p>
                    <p className="text-xs text-soft">
                      {displayName(doc.uploaded_by, email)} · {shortDate(doc.created_at)}
                    </p>
                  </button>
                  <button
                    onClick={() => confirmDelete(doc)}
                    aria-label={`Eliminar ${doc.title}`}
                    className="shrink-0 rounded-pill px-2 py-1 text-lg leading-none text-soft active:text-honey"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
