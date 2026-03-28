import { listNotes, getNote, createNote, updateNote, deleteNote, searchNotes } from './notes';
import { JoplinClient } from '../api/client';

// Mock the JoplinClient
jest.mock('../api/client');

describe('Note Commands', () => {
  let mockClient: jest.Mocked<JoplinClient>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockClient = new JoplinClient('token', 'url') as unknown as jest.Mocked<JoplinClient>;
  });

  describe('listNotes', () => {
    it('should call client.get with /notes', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Note 1' }] });
      
      const result = await listNotes(mockClient);
      
      expect(mockClient.get).toHaveBeenCalledWith('/notes');
      expect(result).toEqual([{ id: '1', title: 'Note 1' }]);
    });

    it('should call client.get with /folders/:id/notes when notebookId is provided', async () => {
        mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Note 1' }] });
        
        const result = await listNotes(mockClient, 'notebook-123');
        
        expect(mockClient.get).toHaveBeenCalledWith('/folders/notebook-123/notes');
        expect(result).toEqual([{ id: '1', title: 'Note 1' }]);
    });
  });

  describe('getNote', () => {
    it('should call client.get with /notes/:id', async () => {
      mockClient.get.mockResolvedValue({ id: '1', title: 'Note 1', body: 'Body' });

      const result = await getNote(mockClient, '1');

      expect(mockClient.get).toHaveBeenCalledWith('/notes/1', { params: { fields: 'id,title,body,parent_id,created_time,updated_time' } });
      expect(result).toEqual({ id: '1', title: 'Note 1', body: 'Body' });
      });  });

  describe('createNote', () => {
    it('should call client.post with /notes and correct data', async () => {
      mockClient.post.mockResolvedValue({ id: '2', title: 'New Note' });
      
      const result = await createNote(mockClient, 'New Note', 'Body content', 'notebook-123');
      
      expect(mockClient.post).toHaveBeenCalledWith('/notes', { 
          title: 'New Note', 
          body: 'Body content',
          parent_id: 'notebook-123'
      });
      expect(result).toEqual({ id: '2', title: 'New Note' });
    });
  });

  describe('updateNote', () => {
    it('should call client.put with /notes/:id and updated fields', async () => {
      mockClient.put.mockResolvedValue({ id: '1', title: 'Updated Title' });
      
      const result = await updateNote(mockClient, '1', { title: 'Updated Title', body: 'Updated Body' });
      
      expect(mockClient.put).toHaveBeenCalledWith('/notes/1', { title: 'Updated Title', body: 'Updated Body' });
      expect(result).toEqual({ id: '1', title: 'Updated Title' });
    });
  });

  describe('deleteNote', () => {
    it('should call client.delete with /notes/:id', async () => {
      mockClient.delete.mockResolvedValue({});
      
      await deleteNote(mockClient, '1');
      
      expect(mockClient.delete).toHaveBeenCalledWith('/notes/1');
    });
  });

  describe('searchNotes', () => {
    it('should call client.get with wildcard query by default', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Note 1' }] });
      
      const result = await searchNotes(mockClient, 'Note 1');
      
      expect(mockClient.get).toHaveBeenCalledWith('/search', {
        params: {
          query: 'type:note *Note 1*',
        },
      });
      expect(result).toEqual([{ id: '1', title: 'Note 1' }]);
    });

    it('should call client.get without wildcards when complex is true', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Note 1' }] });
      
      const result = await searchNotes(mockClient, 'title:Note 1', true);
      
      expect(mockClient.get).toHaveBeenCalledWith('/search', {
        params: {
          query: 'type:note title:Note 1',
        },
      });
      expect(result).toEqual([{ id: '1', title: 'Note 1' }]);
    });
  });
});
