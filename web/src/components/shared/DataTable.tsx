'use client';

import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  /** Render the cell value. Receives the full row. */
  render: (row: T) => React.ReactNode;
  /** Optional CSS width constraint (e.g. "w-24", "max-w-[120px]") */
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  /** Number of skeleton rows to show while loading (default 5) */
  skeletonRows?: number;
  /** Optional key extractor (defaults to index). Use when rows lack a unique `id`. */
  rowKey?: (row: T, idx: number) => string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  loading,
  emptyMessage = 'No data found.',
  skeletonRows = 5,
  rowKey,
}: DataTableProps<T>) {
  /* ── Loading skeleton ──────────────────── */
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 text-xs lg:text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-2 py-2 text-${col.align ?? 'left'} text-xs font-semibold uppercase tracking-wider text-gray-500 lg:px-3`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`skel-${i}`}>
                {columns.map((col) => (
                  <td key={col.key} className={`truncate max-w-[120px] px-2 py-2 text-${col.align ?? 'left'} lg:max-w-[180px] lg:px-3`}>
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ── Empty state ───────────────────────── */
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Add new records to get started."
      />
    );
  }

  /* ── Data rows ─────────────────────────── */
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200 text-xs lg:text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap px-2 py-2 text-${col.align ?? 'left'} text-xs font-semibold uppercase tracking-wider text-gray-500 lg:px-3 ${col.width ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, idx) => {
            const id = rowKey ? rowKey(row, idx) : String((row as any).id ?? idx);
            return (
              <tr key={id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`truncate max-w-[120px] px-2 py-2 text-${col.align ?? 'left'} lg:max-w-[180px] lg:px-3 ${col.width ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
