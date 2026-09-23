import { useEffect, useRef, useState } from 'react'
import { MdClose } from 'react-icons/md'
import { COLORS, isEmptyDraft, newId } from '../lib/notes'

const blankItem = () => ({ id: newId(), text: '', done: false })

export default function NoteEditor({ note, initialType = 'text', onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({
    type: note?.type ?? initialType,
    title: note?.title ?? '',
    body: note?.body ?? '',
    items: note?.items?.length ? note.items : [blankItem()],
    color: note?.color ?? 'default',
  }))
  const titleRef = useRef(null)
  const focusNext = useRef(null) // id of a newly added item that should get focus once it renders
  const empty = isEmptyDraft(draft)

  useEffect(() => {
    titleRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }))
  const setItem = (id, text) => set('items', draft.items.map((item) => (item.id === id ? { ...item, text } : item)))
  const removeItem = (id) => set('items', draft.items.filter((item) => item.id !== id))

  const addItemAfter = (index) => {
    const item = blankItem()
    const items = [...draft.items]
    items.splice(index + 1, 0, item)
    focusNext.current = item.id
    set('items', items)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!empty) onSave(draft)
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="editor"
        data-color={draft.color}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-heading"
        onSubmit={submit}
        onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && submit(e)}
      >
        <div className="editor-head">
          <h2 id="editor-heading">{note ? 'Edit note' : 'New note'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <MdClose />
          </button>
        </div>

        <div className="segmented" role="radiogroup" aria-label="Note type">
          {[
            ['text', 'Note'],
            ['checklist', 'Checklist'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={draft.type === value}
              className={draft.type === value ? 'active' : ''}
              onClick={() => set('type', value)}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="field">
          <span>Title</span>
          <input ref={titleRef} value={draft.title} onChange={(e) => set('title', e.target.value)} maxLength={120} />
        </label>

        {draft.type === 'text' ? (
          <label className="field">
            <span>Note</span>
            <textarea rows={7} value={draft.body} onChange={(e) => set('body', e.target.value)} />
          </label>
        ) : (
          <fieldset className="field">
            <legend>Items</legend>
            <ul className="item-editor">
              {draft.items.map((item, index) => (
                <li key={item.id}>
                  <input
                    ref={(el) => {
                      if (el && focusNext.current === item.id) {
                        el.focus()
                        focusNext.current = null
                      }
                    }}
                    className="item-input"
                    value={item.text}
                    placeholder="List item"
                    aria-label={`Item ${index + 1}`}
                    onChange={(e) => setItem(item.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
                        e.preventDefault()
                        addItemAfter(index)
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <MdClose />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="link-btn" onClick={() => addItemAfter(draft.items.length - 1)}>
              + Add item
            </button>
          </fieldset>
        )}

        <fieldset className="colors">
          <legend>Colour</legend>
          {COLORS.map((color) => (
            <label key={color} className="swatch" data-color={color} title={color}>
              <input
                type="radio"
                name="color"
                value={color}
                checked={draft.color === color}
                onChange={() => set('color', color)}
              />
              <span className="visually-hidden">{color}</span>
            </label>
          ))}
        </fieldset>

        <div className="editor-actions">
          {empty && <p className="hint">Add a title or some content to save.</p>}
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={empty}>
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
