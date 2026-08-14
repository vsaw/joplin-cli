import { listTags, getTag, createTag, updateTag, deleteTag, searchTags, listTagNotes, listNoteTags, addTagToNote, removeTagFromNote } from './tags';
import { JoplinClient } from '../api/client';

// Mock the JoplinClient
jest.mock('../api/client');

describe('Tag Commands', () => {
  let mockClient: jest.Mocked<JoplinClient>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockClient = new JoplinClient('token', 'url') as unknown as jest.Mocked<JoplinClient>;
  });

  describe('listTags', () => {
    it('should call client.get with /tags', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Tag 1' }] });

      const result = await listTags(mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/tags');
      expect(result).toEqual([{ id: '1', title: 'Tag 1' }]);
    });
  });

  describe('getTag', () => {
    it('should call client.get with /tags/:id', async () => {
      mockClient.get.mockResolvedValue({ id: '1', title: 'Tag 1' });

      const result = await getTag(mockClient, '1');

      expect(mockClient.get).toHaveBeenCalledWith('/tags/1');
      expect(result).toEqual({ id: '1', title: 'Tag 1' });
    });
  });

  describe('createTag', () => {
    it('should call client.post with /tags and title', async () => {
      mockClient.post.mockResolvedValue({ id: '2', title: 'New Tag' });

      const result = await createTag(mockClient, 'New Tag');

      expect(mockClient.post).toHaveBeenCalledWith('/tags', { title: 'New Tag' });
      expect(result).toEqual({ id: '2', title: 'New Tag' });
    });
  });

  describe('updateTag', () => {
    it('should call client.put with /tags/:id and title', async () => {
      mockClient.put.mockResolvedValue({ id: '1', title: 'Updated Title' });

      const result = await updateTag(mockClient, '1', 'Updated Title');

      expect(mockClient.put).toHaveBeenCalledWith('/tags/1', { title: 'Updated Title' });
      expect(result).toEqual({ id: '1', title: 'Updated Title' });
    });
  });

  describe('deleteTag', () => {
    it('should call client.delete with /tags/:id', async () => {
      mockClient.delete.mockResolvedValue({});

      await deleteTag(mockClient, '1');

      expect(mockClient.delete).toHaveBeenCalledWith('/tags/1');
    });
  });

  describe('searchTags', () => {
    it('should call client.get with a wildcard query', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Tag 1' }] });

      const result = await searchTags(mockClient, 'Tag 1');

      expect(mockClient.get).toHaveBeenCalledWith('/search', {
        params: {
          query: '*Tag 1*',
          type: 'tag',
        },
      });
      expect(result).toEqual([{ id: '1', title: 'Tag 1' }]);
    });
  });

  describe('listTagNotes', () => {
    it('should call client.get with /tags/:id/notes', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Note 1' }] });

      const result = await listTagNotes(mockClient, 'tag-123');

      expect(mockClient.get).toHaveBeenCalledWith('/tags/tag-123/notes');
      expect(result).toEqual([{ id: '1', title: 'Note 1' }]);
    });
  });

  describe('listNoteTags', () => {
    it('should call client.get with /notes/:id/tags', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Tag 1' }] });

      const result = await listNoteTags(mockClient, 'note-123');

      expect(mockClient.get).toHaveBeenCalledWith('/notes/note-123/tags');
      expect(result).toEqual([{ id: '1', title: 'Tag 1' }]);
    });
  });

  describe('addTagToNote', () => {
    it('should call client.post with /tags/:id/notes and the note id', async () => {
      mockClient.post.mockResolvedValue({});

      await addTagToNote(mockClient, 'tag-123', 'note-123');

      expect(mockClient.post).toHaveBeenCalledWith('/tags/tag-123/notes', { id: 'note-123' });
    });
  });

  describe('removeTagFromNote', () => {
    it('should call client.delete with /tags/:id/notes/:noteId', async () => {
      mockClient.delete.mockResolvedValue({});

      await removeTagFromNote(mockClient, 'tag-123', 'note-123');

      expect(mockClient.delete).toHaveBeenCalledWith('/tags/tag-123/notes/note-123');
    });
  });
});
