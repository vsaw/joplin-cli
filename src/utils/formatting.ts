import { Note } from '../commands/notes';
import { Notebook } from '../commands/notebooks';
import { Tag } from '../commands/tags';

export function formatTable(headers: string[], rows: (Note | Notebook | Tag)[]): string {
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

export function formatNote(note: Note, frontMatter: boolean = false, tags: Tag[] = []): string {
  if (frontMatter) {
    throw new Error('Not implemented');
  }

  if(note.body && note.body.startsWith(`# ${note.title}`)) {
    return note.body;
  }

  return `# ${note.title}\n\n${note.body || ''}`;
}

export function formatNotebook(notebook: Notebook): string {
  return `# ${notebook.title}`;
}

export function formatTag(tag: Tag): string {
  throw new Error('Not implemented');
}
