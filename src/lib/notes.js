export const COLORS = ['default', 'yellow', 'green', 'blue', 'purple', 'pink']

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'text', label: 'Notes' },
  { id: 'checklist', label: 'Checklists' },
  { id: 'pinned', label: 'Pinned' },
]

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

export function createNote({ type = 'text', title = '', body = '', items = [], color = 'default' }, now = Date.now()) {
  return {
    id: newId(),
    type,
    title: title.trim(),
    body: type === 'text' ? body.trim() : '',
    items: type === 'checklist' ? cleanItems(items) : [],
    color,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function cleanItems(items) {
  return items
    .map((item) => ({ id: item.id ?? newId(), text: item.text.trim(), done: Boolean(item.done) }))
    .filter((item) => item.text !== '')
}

export function isEmptyDraft({ type, title, body, items }) {
  if (title.trim()) return false
  if (type === 'checklist') return cleanItems(items).length === 0
  return !body.trim()
}

export function notesReducer(notes, action) {
  const now = action.now ?? Date.now()
  const touch = (id, change) =>
    notes.map((note) => (note.id === id ? { ...note, ...change(note), updatedAt: now } : note))

  switch (action.type) {
    case 'add':
      return [action.note, ...notes]
    case 'update':
      return touch(action.id, () => ({
        title: action.changes.title.trim(),
        body: action.changes.type === 'text' ? action.changes.body.trim() : '',
        items: action.changes.type === 'checklist' ? cleanItems(action.changes.items) : [],
        type: action.changes.type,
        color: action.changes.color,
      }))
    case 'delete':
      return notes.filter((note) => note.id !== action.id)
    case 'restore': {
      const copy = [...notes]
      copy.splice(Math.min(action.index, copy.length), 0, action.note)
      return copy
    }
    case 'togglePin':
      return touch(action.id, (note) => ({ pinned: !note.pinned }))
    case 'toggleItem':
      return touch(action.id, (note) => ({
        items: note.items.map((item) => (item.id === action.itemId ? { ...item, done: !item.done } : item)),
      }))
    case 'clearCompleted':
      return touch(action.id, (note) => ({ items: note.items.filter((item) => !item.done) }))
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

export function matchesQuery(note, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const text = [note.title, note.body, ...note.items.map((item) => item.text)].join(' ').toLowerCase()
  return text.includes(q)
}

export function visibleNotes(notes, { query = '', filter = 'all' } = {}) {
  return notes
    .filter((note) => {
      if (filter === 'pinned') return note.pinned
      if (filter === 'text' || filter === 'checklist') return note.type === filter
      return true
    })
    .filter((note) => matchesQuery(note, query))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt)
}

export function progress(note) {
  const done = note.items.filter((item) => item.done).length
  return { done, total: note.items.length }
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function timeAgo(timestamp, now = Date.now()) {
  const seconds = Math.round((timestamp - now) / 1000)
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}
