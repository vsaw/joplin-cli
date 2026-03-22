import { JoplinClient } from '../api/client';

export interface Notebook {
  id: string;
  title: string;
  [key: string]: any;
}

export async function listNotebooks(client: JoplinClient): Promise<Notebook[]> {
  const result = await client.get<{ items: Notebook[] }>('/folders');
  return result.items;
}

export async function getNotebook(client: JoplinClient, id: string): Promise<Notebook> {
  return client.get<Notebook>(`/folders/${id}`);
}

export async function createNotebook(client: JoplinClient, title: string): Promise<Notebook> {
  return client.post<Notebook>('/folders', { title });
}

export async function updateNotebook(client: JoplinClient, id: string, title: string): Promise<Notebook> {
  return client.put<Notebook>(`/folders/${id}`, { title });
}

export async function deleteNotebook(client: JoplinClient, id: string): Promise<void> {
  await client.delete(`/folders/${id}`);
}
