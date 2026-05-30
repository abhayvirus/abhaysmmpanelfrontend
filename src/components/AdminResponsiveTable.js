import React from 'react';

const cellValue = (col, row) => (col.render ? col.render(row) : row[col.key]);

/**
 * Desktop table + mobile card list for admin pages.
 */
const AdminResponsiveTable = ({
  columns,
  rows = [],
  emptyMessage = 'No data',
  rowKey = 'id',
  className = '',
  tableClassName = 'table',
}) => {
  if (!rows.length) {
    return (
      <p className="admin-table-empty" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
        {emptyMessage}
      </p>
    );
  }

  const getRowKey = (row, index) => row[rowKey] ?? row.id ?? index;
  const headCol = columns[0];
  const statusCol = columns.find((c) => c.highlight || c.key === 'status');
  const detailCols = columns.filter((c) => c !== headCol && c !== statusCol);

  return (
    <>
      <div className={`admin-table-wrap table-wrap ${className}`.trim()}>
        <table className={tableClassName}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={getRowKey(row, index)}>
                {columns.map((col) => (
                  <td key={col.key} style={col.cellStyle}>
                    {cellValue(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-mobile-list">
        {rows.map((row, index) => (
          <div key={getRowKey(row, index)} className="card admin-mobile-card">
            <div className="admin-mobile-card-top">
              <strong>{headCol ? cellValue(headCol, row) : null}</strong>
              {statusCol ? <span>{cellValue(statusCol, row)}</span> : null}
            </div>
            {detailCols.map((col) => {
              const value = cellValue(col, row);
              if (value == null || value === '') return null;
              return (
                <div key={col.key} className="admin-mobile-row">
                  <span>{col.label}</span>
                  <span>{value}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminResponsiveTable;
