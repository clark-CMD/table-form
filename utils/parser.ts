import { TableData } from '../types';

export const parseMarkdownTable = (markdown: string): TableData => {
  const lines = markdown.trim().split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    return { headers: [], rows: [], isValid: false };
  }

  // Helper to split a line by pipe and clean whitespace
  const splitRow = (line: string) => {
    // Remove leading/trailing pipes if they exist (standard MD format)
    const trimmed = line.trim().replace(/^\||\|$/g, '');
    return trimmed.split('|').map(cell => cell.trim());
  };

  const headers = splitRow(lines[0]);
  
  // The second line is usually the separator |---|---|
  // We check if it contains dashes to confirm it's a table
  const separatorLine = lines[1];
  if (!separatorLine.includes('-')) {
    // Basic heuristic: if 2nd line doesn't look like a separator, it might not be a valid table
    // But we'll try to parse it anyway if the user just pasted data. 
    // However, strictly adhering to MD table spec, line 2 must be separator.
    return { headers: [], rows: [], isValid: false };
  }

  const rows = lines.slice(2).map(splitRow);

  return {
    headers,
    rows,
    isValid: headers.length > 0
  };
};
