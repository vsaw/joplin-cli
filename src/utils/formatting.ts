export function formatTable(headers: string[], rows: any[]): string {
  if (rows.length === 0) {
    return 'No data found.';
  }

  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => {
    return `| ${headers.map(header => row[header] || '').join(' | ')} |`;
  }).join('\n');

  return `${headerRow}\n${separatorRow}\n${dataRows}`;
}

export function formatNote(note: any): string {
  if(note.body && note.body.startsWith(`# ${note.title}`)) {
    return note.body;
  }

  return `# ${note.title}\n\n${note.body || ''}`;
}

export function formatNotebook(notebook: any): string {
  return `# ${notebook.title}`;
}
