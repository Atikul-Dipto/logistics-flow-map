import { Filter } from '../icons'

export default function FilterBar({ carriers, value, onChange }) {
  return (
    <div className="filter-bar">
      <Filter className="icon" />
      <label htmlFor="carrier-filter" className="filter-bar__label">
        Carrier
      </label>
      <select id="carrier-filter" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="All">All carriers</option>
        {carriers.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  )
}
