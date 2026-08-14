import { Search } from '../icons'
import './Toolbar.css'

// Shared search + dropdown-filter row used by every module list page.
export default function Toolbar({ searchValue, onSearchChange, searchPlaceholder = 'Search…', filters = [], resultCount, resultLabel = 'results' }) {
  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <Search className="icon" />
        <input value={searchValue} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} />
      </div>
      {filters.map((f) => (
        <select key={f.label} value={f.value} onChange={(e) => f.onChange(e.target.value)} aria-label={f.label}>
          <option value="All">{f.label}: All</option>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ))}
      {resultCount != null && (
        <span className="toolbar__count">
          {resultCount.toLocaleString()} {resultLabel}
        </span>
      )}
    </div>
  )
}
