import { describe, expect, it } from 'vitest'
import { createNote, isEmptyDraft, notesReducer, progress, timeAgo, visibleNotes } from './notes'

const note = (overrides) => ({ ...createNote({ title: 'Note' }, 1000), ...overrides })

describe('createNote', () => {
  it('trims text and drops empty checklist items', () => {
    const n = createNote({ type: 'checklist', title: '  Groceries ', items: [{ text: ' milk ' }, { text: '  ' }] })
    expect(n.title).toBe('Groceries')
    expect(n.items).toHaveLength(1)
    expect(n.items[0]).toMatchObject({ text: 'milk', done: false })
    expect(n.body).toBe('')
  })

  it('gives every note a unique id', () => {
    expect(createNote({ title: 'a' }).id).not.toBe(createNote({ title: 'a' }).id)
  })
})

describe('isEmptyDraft', () => {
  it('treats whitespace as empty', () => {
    expect(isEmptyDraft({ type: 'text', title: ' ', body: '\n', items: [] })).toBe(true)
    expect(isEmptyDraft({ type: 'checklist', title: '', body: '', items: [{ text: ' ' }] })).toBe(true)
  })

  it('accepts a title or content', () => {
    expect(isEmptyDraft({ type: 'text', title: '', body: 'hi', items: [] })).toBe(false)
    expect(isEmptyDraft({ type: 'checklist', title: '', body: '', items: [{ text: 'x' }] })).toBe(false)
  })
})

describe('notesReducer', () => {
  it('deletes only the note with the matching id, even when titles repeat', () => {
    const a = note({ id: 'a', title: 'Same' })
    const b = note({ id: 'b', title: 'Same' })
    expect(notesReducer([a, b], { type: 'delete', id: 'a' })).toEqual([b])
  })

  it('restores a deleted note at its old position', () => {
    const [a, b, c] = ['a', 'b', 'c'].map((id) => note({ id }))
    const after = notesReducer([a, c], { type: 'restore', note: b, index: 1 })
    expect(after.map((n) => n.id)).toEqual(['a', 'b', 'c'])
  })

  it('updates content and the edited time', () => {
    const a = note({ id: 'a' })
    const [updated] = notesReducer([a], {
      type: 'update',
      id: 'a',
      now: 5000,
      changes: { type: 'text', title: ' New ', body: 'Body', items: [], color: 'blue' },
    })
    expect(updated).toMatchObject({ title: 'New', body: 'Body', color: 'blue', updatedAt: 5000 })
  })

  it('toggles pins and checklist items, and clears completed items', () => {
    const list = note({
      id: 'l',
      type: 'checklist',
      items: [
        { id: 'i1', text: 'one', done: false },
        { id: 'i2', text: 'two', done: false },
      ],
    })
    let state = notesReducer([list], { type: 'togglePin', id: 'l' })
    expect(state[0].pinned).toBe(true)
    state = notesReducer(state, { type: 'toggleItem', id: 'l', itemId: 'i1' })
    expect(progress(state[0])).toEqual({ done: 1, total: 2 })
    state = notesReducer(state, { type: 'clearCompleted', id: 'l' })
    expect(state[0].items.map((i) => i.text)).toEqual(['two'])
  })

  it('rejects unknown actions', () => {
    expect(() => notesReducer([], { type: 'nope' })).toThrow('Unknown action')
  })
})

describe('visibleNotes', () => {
  const notes = [
    note({ id: 'old', title: 'Old idea', updatedAt: 1 }),
    note({ id: 'new', title: 'Recent', body: 'mentions React', updatedAt: 3 }),
    note({ id: 'pin', title: 'Pinned', pinned: true, updatedAt: 2 }),
    note({ id: 'list', type: 'checklist', title: 'Shopping', items: [{ id: 'x', text: 'Bread', done: false }], updatedAt: 0 }),
  ]

  it('puts pinned notes first, then newest', () => {
    expect(visibleNotes(notes).map((n) => n.id)).toEqual(['pin', 'new', 'old', 'list'])
  })

  it('searches titles, bodies and checklist items, ignoring case', () => {
    expect(visibleNotes(notes, { query: 'react' }).map((n) => n.id)).toEqual(['new'])
    expect(visibleNotes(notes, { query: 'BREAD' }).map((n) => n.id)).toEqual(['list'])
  })

  it('filters by type and pinned', () => {
    expect(visibleNotes(notes, { filter: 'checklist' }).map((n) => n.id)).toEqual(['list'])
    expect(visibleNotes(notes, { filter: 'pinned' }).map((n) => n.id)).toEqual(['pin'])
  })
})

describe('timeAgo', () => {
  it('formats recent times', () => {
    const now = 10_000_000
    expect(timeAgo(now - 10_000, now)).toBe('just now')
    expect(timeAgo(now - 5 * 60_000, now)).toBe('5 minutes ago')
    expect(timeAgo(now - 86_400_000, now)).toBe('yesterday')
  })
})
