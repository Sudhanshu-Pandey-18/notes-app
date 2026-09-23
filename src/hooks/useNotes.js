import { useEffect, useReducer } from 'react'
import { notesReducer } from '../lib/notes'

const KEY = 'notex:notes'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function useNotes() {
  const [notes, dispatch] = useReducer(notesReducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(notes))
    } catch {
      // Ignore storage errors; notes stay in memory.
    }
  }, [notes])

  return [notes, dispatch]
}
