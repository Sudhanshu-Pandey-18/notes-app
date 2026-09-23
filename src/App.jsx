import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MdAdd, MdChecklist } from 'react-icons/md'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import NoteCard from './components/NoteCard'
import NoteEditor from './components/NoteEditor'
import UndoToast from './components/UndoToast'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNotes } from './hooks/useNotes'
import { createNote, visibleNotes } from './lib/notes'

const systemTheme = () => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export default function App() {
  const [notes, dispatch] = useNotes()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editor, setEditor] = useState(null) // { note } when editing, { type } when creating
  const [deleted, setDeleted] = useState(null) // { note, index } for undo
  const [savedTheme, setSavedTheme] = useLocalStorage('notex:theme', null)
  const searchRef = useRef(null)

  const theme = savedTheme ?? systemTheme()

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const onKey = (e) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if (e.key === '/' && !typing && !editor) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editor])

  const shown = useMemo(() => visibleNotes(notes, { query, filter }), [notes, query, filter])

  const counts = useMemo(
    () => ({
      all: notes.length,
      text: notes.filter((n) => n.type === 'text').length,
      checklist: notes.filter((n) => n.type === 'checklist').length,
      pinned: notes.filter((n) => n.pinned).length,
    }),
    [notes]
  )

  const closeEditor = useCallback(() => setEditor(null), [])
  const dismissUndo = useCallback(() => setDeleted(null), [])

  const save = (draft) => {
    if (editor?.note) dispatch({ type: 'update', id: editor.note.id, changes: draft })
    else dispatch({ type: 'add', note: createNote(draft) })
    setEditor(null)
  }

  const remove = (id) => {
    const index = notes.findIndex((n) => n.id === id)
    setDeleted({ note: notes[index], index })
    dispatch({ type: 'delete', id })
  }

  const undo = () => {
    dispatch({ type: 'restore', note: deleted.note, index: deleted.index })
    setDeleted(null)
  }

  return (
    <>
      <Header
        ref={searchRef}
        query={query}
        onQueryChange={setQuery}
        theme={theme}
        onToggleTheme={() => setSavedTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      <main className="main">
        <div className="toolbar">
          <FilterBar filter={filter} onChange={setFilter} counts={counts} />
          <div className="new-buttons">
            <button type="button" className="btn primary" onClick={() => setEditor({ type: 'text' })}>
              <MdAdd aria-hidden="true" /> New note
            </button>
            <button type="button" className="btn" onClick={() => setEditor({ type: 'checklist' })}>
              <MdChecklist aria-hidden="true" /> New checklist
            </button>
          </div>
        </div>

        {shown.length > 0 ? (
          <section className="grid" aria-label="Notes">
            {shown.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={(n) => setEditor({ note: n })}
                onDelete={remove}
                onTogglePin={(id) => dispatch({ type: 'togglePin', id })}
                onToggleItem={(id, itemId) => dispatch({ type: 'toggleItem', id, itemId })}
                onClearCompleted={(id) => dispatch({ type: 'clearCompleted', id })}
              />
            ))}
          </section>
        ) : (
          <div className="empty">
            {notes.length === 0 ? (
              <>
                <h2>No notes yet</h2>
                <p>Create a note or a checklist to get started. Everything is saved in your browser.</p>
              </>
            ) : (
              <>
                <h2>Nothing matches</h2>
                <p>Try a different search or filter.</p>
              </>
            )}
          </div>
        )}
      </main>

      {editor && (
        <NoteEditor
          key={editor.note?.id ?? editor.type}
          note={editor.note}
          initialType={editor.type}
          onSave={save}
          onClose={closeEditor}
        />
      )}

      {deleted && <UndoToast key={deleted.note.id} onUndo={undo} onDismiss={dismissUndo} />}
    </>
  )
}
