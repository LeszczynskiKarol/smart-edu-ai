// src/components/ui/DataGrid.tsx
import React from 'react';

export type SortDirection = 'asc' | 'desc';

interface Column<T> {
  field: keyof T | string;
  headerName: string;
  width: number;
  renderCell?: (params: { row: T }) => React.ReactNode;
  sortable?: boolean;
}

interface DataGridProps<T> {
  rows: T[];
  columns: Column<T>[];
  pageSize: number;
  loading?: boolean;
  error?: string | null;
  onPageChange: (page: number) => void;
  rowCount: number;
  pagination?: boolean;
  sortModel?: {
    field: string;
    direction: SortDirection;
  };
  onSortModelChange?: (model: {
    field: string;
    direction: SortDirection;
  }) => void;
}

export function DataGrid<T>({
  rows,
  columns,
  pageSize,
  loading,
  error,
  onPageChange,
  rowCount,
  pagination,
  sortModel,
  onSortModelChange,
}: DataGridProps<T>): React.ReactElement {
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const handleSort = (field: string) => {
    if (!onSortModelChange) return;

    const newDirection: SortDirection =
      sortModel?.field === field && sortModel.direction === 'asc'
        ? 'desc'
        : 'asc';

    onSortModelChange({ field, direction: newDirection });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.field)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                style={{ width: column.width }}
                onClick={() =>
                  column.sortable && handleSort(String(column.field))
                }
              >
                <div className="flex items-center">
                  {column.headerName}
                  {column.sortable && (
                    <span className="ml-2">
                      {sortModel?.field === column.field &&
                        (sortModel.direction === 'asc' ? '↑' : '↓')}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={String(column.field)}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  {column.renderCell
                    ? column.renderCell({ row })
                    : String(row[column.field as keyof T])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination && (
        <div className="px-6 py-3 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-700">
            Showing {Math.min(pageSize, rowCount)} of {rowCount} results
          </span>
          <div className="flex gap-2">
            {Array.from(
              { length: Math.ceil(rowCount / pageSize) },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className="px-3 py-1 border rounded hover:bg-gray-100"
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
