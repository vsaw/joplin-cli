import { Note } from '../commands/notes';
import { Notebook } from '../commands/notebooks';

export function formatTable(headers: string[], rows: Note[] | Notebook[]): string {
  if (rows.length === 0) {
    return 'No data found.';
  }

  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => {
    return `| ${headers.map(header => String(row[header] ?? '')).join(' | ')} |`;
  }).join('\n');

  return `${headerRow}\n${separatorRow}\n${dataRows}`;
}

export function formatNote(note: Note): string {
  if(note.body && note.body.startsWith(`# ${note.title}`)) {
    return note.body;
  }

  return `# ${note.title}\n\n${note.body || ''}`;
}

export function formatNotebook(notebook: Notebook): string {
  return `# ${notebook.title}`;
}
