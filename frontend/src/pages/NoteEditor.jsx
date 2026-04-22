import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'

export default function NoteEditor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const { push } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  const lastSavedRef = useRef({ title: '', description: '' })

  const draftKey = 'draft:note:new'

  async function loadNote(noteId) {
    setError('')
    setLoading(true)
    try {
      const res = await api.get(`/notes/${noteId}`)
      const note = res.data.note
      setTitle(note.title || '')
      setDescription(note.description || '')
      lastSavedRef.current = { title: note.title || '', description: note.description || '' }
      setDirty(false)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load note'
      setError(msg)
      push({ tone: 'error', title: 'Load failed', message: msg })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isNew && id) loadNote(id)
  }, [id, isNew])

  useEffect(() => {
    if (!isNew) return
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const draft = JSON.parse(raw)
      if (draft?.title) setTitle(String(draft.title))
      if (draft?.description) setDescription(String(draft.description))
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const baseline = lastSavedRef.current
    setDirty(title !== baseline.title || description !== baseline.description)
  }, [title, description])

  useEffect(() => {
    if (!isNew) return
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ title, description }))
      } catch {
        // ignore
      }
    }, 400)
    return () => window.clearTimeout(t)
  }, [title, description, isNew])

  useEffect(() => {
    function onKeyDown(e) {
      const isSave = (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')
      if (!isSave) return
      e.preventDefault()
      onSave()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, saving, id, isNew])

  const canSave = useMemo(() => title.trim().length > 0 && !saving, [title, saving])

  async function onSave() {
    if (!canSave) return
    setError('')
    setSaving(true)
    try {
      if (isNew) {
        await api.post('/notes', { title, description })
        try {
          localStorage.removeItem(draftKey)
        } catch {
          // ignore
        }
        push({ tone: 'success', title: 'Saved', message: 'Note created successfully.' })
      } else {
        await api.put(`/notes/${id}`, { title, description })
        push({ tone: 'success', title: 'Saved', message: 'Changes saved.' })
      }
      lastSavedRef.current = { title, description }
      setDirty(false)
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Save failed'
      setError(msg)
      push({ tone: 'error', title: 'Save failed', message: msg })
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (isNew) return
    setError('')
    try {
      await api.delete(`/notes/${id}`)
      push({ tone: 'success', title: 'Deleted', message: 'Note deleted.' })
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Delete failed'
      setError(msg)
      push({ tone: 'error', title: 'Delete failed', message: msg })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{isNew ? 'Create Note' : 'Edit Note'}</h1>
          <p className="text-sm text-slate-600">
            <Link className="underline" to="/">
              Back to dashboard
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-500 sm:inline">
            {saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'Saved'}
          </span>
          {!isNew ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save (Ctrl+S)'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="animate-pulse rounded-xl border bg-white p-5">
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="mt-2 h-10 w-full rounded bg-slate-100" />
          <div className="mt-6 h-4 w-28 rounded bg-slate-100" />
          <div className="mt-2 h-40 w-full rounded bg-slate-100" />
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none transition focus:border-slate-400"
              placeholder="Note title"
              required
            />
            <div className="mt-1 text-xs text-slate-500">{title.trim().length} characters</div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-48 w-full rounded-md border px-3 py-2 outline-none transition focus:border-slate-400"
              placeholder="Write something…"
            />
            <div className="mt-1 text-xs text-slate-500">
              Tip: press <span className="font-medium">Ctrl+S</span> to save.
            </div>
          </label>
        </div>
      )}
    </div>
  )
}

