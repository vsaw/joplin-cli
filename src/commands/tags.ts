import { JoplinClient } from '../api/client';
import { Note } from './notes';

export interface Tag {
  id: string;
  title: string;
  [key: string]: unknown;
}

export async function listTags(client: JoplinClient): Promise<Tag[]> {
  throw new Error('Not implemented');
}

export async function getTag(client: JoplinClient, id: string): Promise<Tag> {
  throw new Error('Not implemented');
}

export async function createTag(client: JoplinClient, title: string): Promise<Tag> {
  throw new Error('Not implemented');
}

export async function updateTag(client: JoplinClient, id: string, title: string): Promise<Tag> {
  throw new Error('Not implemented');
}

export async function deleteTag(client: JoplinClient, id: string): Promise<void> {
  throw new Error('Not implemented');
}

export async function searchTags(client: JoplinClient, query: string): Promise<Tag[]> {
  throw new Error('Not implemented');
}

export async function listTagNotes(client: JoplinClient, tagId: string): Promise<Note[]> {
  throw new Error('Not implemented');
}

export async function listNoteTags(client: JoplinClient, noteId: string): Promise<Tag[]> {
  throw new Error('Not implemented');
}

export async function addTagToNote(client: JoplinClient, tagId: string, noteId: string): Promise<void> {
  throw new Error('Not implemented');
}

export async function removeTagFromNote(client: JoplinClient, tagId: string, noteId: string): Promise<void> {
  throw new Error('Not implemented');
}
