import { JoplinClient } from '../api/client';
import { Note } from './notes';

export interface Tag {
  id: string;
  title: string;
  [key: string]: unknown;
}

export async function listTags(client: JoplinClient): Promise<Tag[]> {
  const result = await client.get<{ items: Tag[] }>('/tags');
  return result.items;
}

export async function getTag(client: JoplinClient, id: string): Promise<Tag> {
  return client.get<Tag>(`/tags/${id}`);
}

export async function createTag(client: JoplinClient, title: string): Promise<Tag> {
  return client.post<Tag>('/tags', { title });
}

export async function updateTag(client: JoplinClient, id: string, title: string): Promise<Tag> {
  return client.put<Tag>(`/tags/${id}`, { title });
}

export async function deleteTag(client: JoplinClient, id: string): Promise<void> {
  await client.delete(`/tags/${id}`);
}

export async function searchTags(client: JoplinClient, query: string): Promise<Tag[]> {
  const result = await client.get<{ items: Tag[] }>('/search', {
    params: {
      query: `*${query}*`,
      type: 'tag',
    },
  });
  return result.items;
}

export async function listTagNotes(client: JoplinClient, tagId: string): Promise<Note[]> {
  const result = await client.get<{ items: Note[] }>(`/tags/${tagId}/notes`);
  return result.items;
}

export async function addTagToNote(client: JoplinClient, tagId: string, noteId: string): Promise<void> {
  await client.post(`/tags/${tagId}/notes`, { id: noteId });
}

export async function removeTagFromNote(client: JoplinClient, tagId: string, noteId: string): Promise<void> {
  await client.delete(`/tags/${tagId}/notes/${noteId}`);
}
