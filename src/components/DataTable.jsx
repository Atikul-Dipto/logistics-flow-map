import { useEffect, useMemo, useState } from 'react'
import './DataTable.css'

// Generic sortable (and optionally paginated) table shared by every
// module list page -- one implementation instead of ten bespoke ones.
export default function DataTable({ columns, rows, keyField = 'id', onRowClick, emptyLabel = 'No records found.', defaultSort, pageSize }) {
  const [sort, setSort] = useState(defaultSort || null)
  const [page, setPage] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [rows.length])

  const sortedRows = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    const sortKey = col?.sortKey || sort.key
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string') return av.localeCompare(bv) * dir
      return (av - bv) * dir
    })
  }, [rows, sort, columns])

  const pageCount = pageSize ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1
  const pageRows = pageSize ? sortedRows.slice(page * pageSize, page * pageSize + pageSize) : sortedRows

  const toggleSort = (col) => {
    if (!col.sortable) return
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, dir: 'desc' }
      return { key: col.key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
    })
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={[c.align === 'right' ? 'data-table__th--right' : '', c.sortable ? 'data-table__th--sortable' : ''].filter(Boolean).join(' ')}
                onClick={() => toggleSort(c)}
              >
                {c.label}
                {c.sortable && sort?.key === c.key && <span className="data-table__sort-arrow">{sort.dir === 'asc' ? ' ▲' : ' ▼'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 && (
            <tr>
              <td className="data-table__empty" colSpan={columns.length}>
                {emptyLabel}
              </td>
            </tr>
          )}
          {pageRows.map((row) => (
            <tr key={row[keyField]} className={onRowClick ? 'data-table__row--clickable' : undefined} onClick={onRowClick ? () => onRowClick(row) : undefined}>
              {columns.map((c) => (
                <td key={c.key} className={c.align === 'right' ? 'data-table__td--right' : undefined}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pageSize && pageCount > 1 && (
        <div className="data-table__pager">
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {page + 1} of {pageCount} &middot; {sortedRows.length.toLocaleString()} rows
          </span>
          <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  )
}
