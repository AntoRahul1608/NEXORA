import React from 'react';

interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  rows: Record<string, any>[];
  className?: string;
}

export const TableDisplay: React.FC<TableProps> = ({
  columns = [],
  rows = [],
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-dark-600 bg-dark-800/20 glass ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-dark-600 bg-dark-800/50 text-dark-200 font-semibold">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-600/50 text-white">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-dark-400">
                No data available
              </td>
            </tr>
          ) : (
            rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 truncate max-w-[200px]">
                    {row[col.key] !== undefined ? String(row[col.key]) : '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default TableDisplay;
