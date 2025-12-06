import React, { forwardRef } from 'react';
import { TableData } from '../types';

interface PreviewAreaProps {
  data: TableData;
}

// Inline styles are CRITICAL here. 
// Tailwind classes might not be copied correctly to Word/Office clipboard.
// We use explicit inline CSS to ensure cross-app compatibility.
const styles = {
  container: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    display: 'inline-block', // Shrink to fit content for the image export
    minWidth: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    // Font stack: English matches Times New Roman first. Chinese falls back to SimSun (宋体).
    fontFamily: '"Times New Roman", "SimSun", "宋体", serif', 
    // "Wu Hao" (五号) is standard 10.5pt. 
    fontSize: '10.5pt',
    color: '#000000',
    textAlign: 'center' as const,
  },
  // Top border of the table (Bold)
  theadRow: {
    borderTop: '2pt solid #000000',
    borderBottom: '1pt solid #000000', // Bottom of header row is thinner
  },
  th: {
    padding: '8px 16px',
    fontWeight: 'bold' as const,
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '8px 16px',
    whiteSpace: 'nowrap' as const,
  },
  // We apply the bottom border to the LAST row dynamically
};

export const PreviewArea = forwardRef<HTMLDivElement, PreviewAreaProps>(({ data }, ref) => {
  if (!data.isValid) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-12 text-gray-400">
        <i className="fa-solid fa-table mb-4 text-4xl"></i>
        <p>Enter valid Markdown table to see preview</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-inner h-full">
      {/* This wrapper div is what gets captured by html2canvas and the clipboard copier */}
      <div ref={ref} style={styles.container}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              {data.headers.map((header, index) => (
                <th key={index} style={styles.th}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => {
              const isLastRow = rowIndex === data.rows.length - 1;
              const rowStyle = isLastRow
                ? { borderBottom: '2pt solid #000000' } // Bold bottom border for last row
                : {}; 

              return (
                <tr key={rowIndex} style={rowStyle}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={styles.td}>
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

PreviewArea.displayName = 'PreviewArea';