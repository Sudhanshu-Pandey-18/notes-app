import { FILTERS } from '../lib/notes'

export default function FilterBar({ filter, onChange, counts }) {
  return (
    <div className="filters" role="tablist" aria-label="Filter notes">
      {FILTERS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={filter === id}
          className={filter === id ? 'filter active' : 'filter'}
          onClick={() => onChange(id)}
        >
          {label} <span className="count">{counts[id]}</span>
        </button>
      ))}
    </div>
  )
}
