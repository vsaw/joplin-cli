import { listNotebooks, getNotebook, createNotebook, updateNotebook, deleteNotebook, searchNotebooks } from './notebooks';
import { JoplinClient } from '../api/client';

// Mock the JoplinClient
jest.mock('../api/client');

describe('Notebook Commands', () => {
  let mockClient: jest.Mocked<JoplinClient>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    mockClient = new JoplinClient('token', 'url') as any;
  });

  describe('listNotebooks', () => {
    it('should call client.get with /folders', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Notebook 1' }] });
      
      const result = await listNotebooks(mockClient);
      
      expect(mockClient.get).toHaveBeenCalledWith('/folders');
      expect(result).toEqual([{ id: '1', title: 'Notebook 1' }]);
    });
  });

  describe('getNotebook', () => {
    it('should call client.get with /folders/:id', async () => {
      mockClient.get.mockResolvedValue({ id: '1', title: 'Notebook 1' });
      
      const result = await getNotebook(mockClient, '1');
      
      expect(mockClient.get).toHaveBeenCalledWith('/folders/1');
      expect(result).toEqual({ id: '1', title: 'Notebook 1' });
    });
  });

  describe('createNotebook', () => {
    it('should call client.post with /folders and title', async () => {
      mockClient.post.mockResolvedValue({ id: '2', title: 'New Notebook' });
      
      const result = await createNotebook(mockClient, 'New Notebook');
      
      expect(mockClient.post).toHaveBeenCalledWith('/folders', { title: 'New Notebook' });
      expect(result).toEqual({ id: '2', title: 'New Notebook' });
    });
  });

  describe('updateNotebook', () => {
    it('should call client.put with /folders/:id and title', async () => {
      mockClient.put.mockResolvedValue({ id: '1', title: 'Updated Title' });
      
      const result = await updateNotebook(mockClient, '1', 'Updated Title');
      
      expect(mockClient.put).toHaveBeenCalledWith('/folders/1', { title: 'Updated Title' });
      expect(result).toEqual({ id: '1', title: 'Updated Title' });
    });
  });

  describe('deleteNotebook', () => {
    it('should call client.delete with /folders/:id', async () => {
      mockClient.delete.mockResolvedValue({});
      
      await deleteNotebook(mockClient, '1');
      
      expect(mockClient.delete).toHaveBeenCalledWith('/folders/1');
    });
  });

  describe('searchNotebooks', () => {
    it('should call client.get with wildcard query by default', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Notebook 1' }] });

      const result = await searchNotebooks(mockClient, 'Notebook 1');

      expect(mockClient.get).toHaveBeenCalledWith('/search', {
        params: {
          query: '*Notebook 1*',
          type: 'folder',
        },
      });
      expect(result).toEqual([{ id: '1', title: 'Notebook 1' }]);
    });

    it('should call client.get without wildcards when complex is true', async () => {
      mockClient.get.mockResolvedValue({ items: [{ id: '1', title: 'Notebook 1' }] });

      const result = await searchNotebooks(mockClient, 'title:Notebook 1', true);

      expect(mockClient.get).toHaveBeenCalledWith('/search', {
        params: {
          query: 'title:Notebook 1',
          type: 'folder',
        },
      });
      expect(result).toEqual([{ id: '1', title: 'Notebook 1' }]);
    });
  });
});
