import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

async function addNote(user, title, body = '') {
  await user.click(screen.getByRole('button', { name: /new note/i }))
  await user.type(screen.getByLabelText('Title'), title)
  if (body) await user.type(screen.getByLabelText('Note'), body)
  await user.click(screen.getByRole('button', { name: 'Save' }))
}

describe('App', () => {
  it('shows an empty state at first', () => {
    render(<App />)
    expect(screen.getByText('No notes yet')).toBeInTheDocument()
  })

  it('creates a note and keeps it after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await addNote(user, 'Interview prep', 'Revise SQL joins')
    expect(screen.getByRole('article', { name: 'Interview prep' })).toHaveTextContent('Revise SQL joins')

    unmount()
    render(<App />)
    expect(screen.getByRole('article', { name: 'Interview prep' })).toBeInTheDocument()
  })

  it('does not allow saving an empty note', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /new note/i }))
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    await user.type(screen.getByLabelText('Title'), '   ')
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('builds a checklist and tracks progress', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /new checklist/i }))
    await user.type(screen.getByLabelText('Title'), 'Groceries')
    await user.type(screen.getByLabelText('Item 1'), 'Milk{Enter}')
    expect(screen.getByLabelText('Item 2')).toHaveFocus()
    await user.keyboard('Eggs')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const card = screen.getByRole('article', { name: 'Groceries' })
    expect(within(card).getByText('0 of 2 done')).toBeInTheDocument()
    await user.click(within(card).getByRole('checkbox', { name: 'Milk' }))
    expect(within(card).getByText('1 of 2 done')).toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'Clear completed' }))
    expect(within(card).queryByText('Milk')).not.toBeInTheDocument()
  })

  it('edits an existing note', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addNote(user, 'Draft')
    await user.click(screen.getByRole('button', { name: 'Edit Draft' }))
    const title = screen.getByLabelText('Title')
    await user.clear(title)
    await user.type(title, 'Final')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('article', { name: 'Final' })).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'Draft' })).not.toBeInTheDocument()
  })

  it('deletes one of two notes with the same title and can undo it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addNote(user, 'Same', 'first')
    await addNote(user, 'Same', 'second')

    await user.click(screen.getAllByRole('button', { name: 'Delete Same' })[0])
    expect(screen.getAllByRole('article', { name: 'Same' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getAllByRole('article', { name: 'Same' })).toHaveLength(2)
  })

  it('filters notes with search', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addNote(user, 'Python notes')
    await addNote(user, 'React notes')
    await user.type(screen.getByRole('searchbox', { name: 'Search notes' }), 'react')
    expect(screen.getByRole('article', { name: 'React notes' })).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'Python notes' })).not.toBeInTheDocument()
  })
})
