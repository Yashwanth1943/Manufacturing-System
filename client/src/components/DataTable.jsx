import { useMemo, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import './DataTable.css';

function DataTable({ columns, rows, actions = [], filters = [] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();
    return rows.filter((row) => {
      const matchesSearch = !query || Object.values(row).some((value) => String(value).toLowerCase().includes(query));
      const matchesFilter = filter === 'all' || Object.values(row).some((value) => String(value) === filter);
      return matchesSearch && matchesFilter;
    });
  }, [rows, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const updateSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const updateFilter = (event) => {
    setFilter(event.target.value);
    setPage(1);
  };

  return (
    <div className="data-table-shell">
      <div className="table-controls">
        <input value={search} onChange={updateSearch} placeholder="Search table..." aria-label="Search table" />
        <select value={filter} onChange={updateFilter} aria-label="Filter table">
          <option value="all">All records</option>
          {filters.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              {actions.length > 0 && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.type === 'status' ? <StatusBadge status={row[column.key]} /> : row[column.key]}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td>
                    <div className="row-actions">
                      {actions.map((action) => (
                        <button
                          className={action.variant || 'secondary'}
                          disabled={action.disabled?.(row)}
                          key={action.label}
                          onClick={() => action.onClick(row)}
                          type="button"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {pagedRows.length === 0 && <div className="table-empty">No matching records found.</div>}
      </div>

      <div className="pagination-controls">
        <span>{filteredRows.length} records</span>
        <div>
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <strong>{currentPage} / {totalPages}</strong>
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
