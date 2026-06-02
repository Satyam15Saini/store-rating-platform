import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Database } from 'lucide-react';

export interface TableHeader {
  key: string;
  label: string;
  sortable?: boolean;
}

interface TableProps {
  headers: TableHeader[];
  data: any[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  renderRow: (item: any, index: number) => React.ReactNode;
  emptyMessage?: string;
}

const Table: React.FC<TableProps> = ({
  headers,
  data,
  sortBy,
  sortOrder,
  onSort,
  renderRow,
  emptyMessage = 'No data available in this table.',
}) => {
  const handleSortClick = (header: TableHeader) => {
    if (header.sortable && onSort) {
      onSort(header.key);
    }
  };

  return (
    <div className="table-wrapper animate-fade">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => {
              const isSorted = sortBy === header.key;
              const isSortable = !!header.sortable;

              return (
                <th
                  key={header.key}
                  className={isSortable ? 'sortable' : ''}
                  onClick={() => handleSortClick(header)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {header.label}
                    {isSortable && (
                      <span className="sort-icon">
                        {isSorted ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp size={14} color="var(--primary)" />
                          ) : (
                            <ArrowDown size={14} color="var(--primary)" />
                          )
                        ) : (
                          <ArrowUpDown size={14} color="var(--text-muted)" opacity={0.6} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={headers.length}>
                <div className="empty-state">
                  <Database size={48} className="empty-state-icon" />
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
