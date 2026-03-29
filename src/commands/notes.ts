import { JoplinClient } from '../api/client';

export interface Note {
  id: string;
  title: string;
  body: string;
  parent_id: string;
  [key: string]: unknown;
}

export async function listNotes(client: JoplinClient, notebookId?: string): Promise<Note[]> {
  const url = notebookId ? `/folders/${notebookId}/notes` : '/notes';
  const result = await client.get<{ items: Note[] }>(url);
  return result.items;
}

export async function getNote(client: JoplinClient, id: string): Promise<Note> {
  return client.get<Note>(`/notes/${id}`, {
    params: {
      fields: ['id', 'title', 'body', 'parent_id', 'created_time', 'updated_time'].join(','),
    }
  });
}

export async function createNote(client: JoplinClient, title: string, body: string, notebookId: string): Promise<Note> {
  return client.post<Note>('/notes', {
    title,
    body,
    parent_id: notebookId
  });
}

export async function updateNote(client: JoplinClient, id: string, updates: Partial<Note>): Promise<Note> {
  return client.put<Note>(`/notes/${id}`, updates);
}

export async function deleteNote(client: JoplinClient, id: string): Promise<void> {
  await client.delete(`/notes/${id}`);
}

export async function searchNotes(client: JoplinClient, query: string, complex: boolean = false): Promise<Note[]> {
  const searchQuery = complex ? query : `*${query}*`;
  const result = await client.get<{ items: Note[] }>('/search', {
    params: {
      query: `type:note ${searchQuery}`,
    },
  });
  return result.items;
}
