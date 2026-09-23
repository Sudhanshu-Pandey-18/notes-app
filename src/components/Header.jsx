import { forwardRef } from 'react'
import { MdDarkMode, MdLightMode, MdSearch } from 'react-icons/md'

const Header = forwardRef(function Header({ query, onQueryChange, theme, onToggleTheme }, searchRef) {
  return (
    <header className="header">
      <div className="header-inner">
        <a className="logo" href="./">
          Note<span>X</span>
        </a>
        <label className="search">
          <MdSearch aria-hidden="true" />
          <span className="visually-hidden">Search notes</span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search notes  ( / )"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
        </button>
      </div>
    </header>
  )
})

export default Header
