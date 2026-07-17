import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { DocCategory, DocumentRow } from '../lib/types'

export function useDocuments() {
  const { email } = useAuth()
  const toast = useToast()
  const [docs, setDocs] = useState<DocumentRow[] | null>(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setDocs(data as DocumentRow[])
    } catch {
      toast('No se pudieron cargar los documentos', 'error')
      setDocs((d) => d ?? [])
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const upload = useCallback(
    async (file: File, title: string, category: DocCategory) => {
      if (!email) return false
      setUploading(true)
      const safeName = file.name.replace(/[^\w.\-]+/g, '_')
      const path = `${category}/${crypto.randomUUID()}-${safeName}`
      try {
        const { error: upErr } = await supabase.storage
          .from('docs')
          .upload(path, file)
        if (upErr) throw upErr
        const { error: rowErr } = await supabase.from('documents').insert({
          title,
          category,
          storage_path: path,
          uploaded_by: email,
        })
        if (rowErr) {
          // no dejes el archivo huérfano en Storage
          await supabase.storage.from('docs').remove([path])
          throw rowErr
        }
      } catch {
        setUploading(false)
        toast('No se pudo subir el documento', 'error')
        return false
      }
      setUploading(false)
      toast('Documento subido')
      await load()
      return true
    },
    [email, toast, load]
  )

  const view = useCallback(
    async (doc: DocumentRow) => {
      try {
        const { data, error } = await supabase.storage
          .from('docs')
          .createSignedUrl(doc.storage_path, 60 * 60)
        if (error || !data) throw error
        window.open(data.signedUrl, '_blank', 'noopener')
      } catch {
        toast('No se pudo abrir el documento', 'error')
      }
    },
    [toast]
  )

  const remove = useCallback(
    async (doc: DocumentRow) => {
      try {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', doc.id)
        if (error) throw error
        await supabase.storage.from('docs').remove([doc.storage_path])
      } catch {
        toast('No se pudo eliminar', 'error')
        return
      }
      toast('Documento eliminado')
      await load()
    },
    [toast, load]
  )

  return { docs, uploading, upload, view, remove }
}
