import { MdDeleteOutline, MdEdit, MdPushPin, MdOutlinePushPin } from 'react-icons/md'
import { progress, timeAgo } from '../lib/notes'

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleItem, onClearCompleted }) {
  const { done, total } = progress(note)
  const label = note.title || 'Untitled note'

  return (
    <article className="card" data-color={note.color} aria-label={label}>
      <div className="card-top">
        <h3 className={note.title ? '' : 'muted'}>{label}</h3>
        <button
          type="button"
          className={note.pinned ? 'icon-btn pinned' : 'icon-btn'}
          onClick={() => onTogglePin(note.id)}
          aria-label={note.pinned ? `Unpin ${label}` : `Pin ${label}`}
          aria-pressed={note.pinned}
        >
          {note.pinned ? <MdPushPin /> : <MdOutlinePushPin />}
        </button>
      </div>

      {note.type === 'text' ? (
        <p className="card-body">{note.body}</p>
      ) : (
        <>
          <ul className="checklist">
            {note.items.map((item) => (
              <li key={item.id} className={item.done ? 'done' : ''}>
                <label>
                  <input type="checkbox" checked={item.done} onChange={() => onToggleItem(note.id, item.id)} />
                  <span>{item.text}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="progress-row">
            <span className="progress-text">
              {done} of {total} done
            </span>
            {done > 0 && (
              <button type="button" className="link-btn" onClick={() => onClearCompleted(note.id)}>
                Clear completed
              </button>
            )}
          </div>
          <div className="progress" aria-hidden="true">
            <div style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
          </div>
        </>
      )}

      <div className="card-footer">
        <time dateTime={new Date(note.updatedAt).toISOString()}>Edited {timeAgo(note.updatedAt)}</time>
        <div className="card-actions">
          <button type="button" className="icon-btn" onClick={() => onEdit(note)} aria-label={`Edit ${label}`}>
            <MdEdit />
          </button>
          <button type="button" className="icon-btn" onClick={() => onDelete(note.id)} aria-label={`Delete ${label}`}>
            <MdDeleteOutline />
          </button>
        </div>
      </div>
    </article>
  )
}
