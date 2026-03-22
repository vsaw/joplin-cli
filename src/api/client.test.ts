import axios from 'axios';
import { JoplinClient } from './client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JoplinClient', () => {
  const token = 'test-token';
  const baseUrl = 'http://localhost:41184';
  let client: JoplinClient;
  let mockInstance: any;

  beforeEach(() => {
    mockInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };
    mockedAxios.create.mockReturnValue(mockInstance);
    client = new JoplinClient(token, baseUrl);
    jest.clearAllMocks();
  });

  describe('request', () => {
    it('should make a GET request with the correct token', async () => {
      mockInstance.get.mockResolvedValue({ data: { items: [] } });

      await client.get('/folders');

      expect(mockInstance.get).toHaveBeenCalledWith('/folders', {
        params: { token },
      });
    });

    it('should make a POST request with the correct token and data', async () => {
      const data = { title: 'New Notebook' };
      mockInstance.post.mockResolvedValue({ data: { id: '123', ...data } });

      await client.post('/folders', data);

      expect(mockInstance.post).toHaveBeenCalledWith(
        '/folders',
        data,
        { params: { token } }
      );
    });

    it('should make a PUT request with the correct token and data', async () => {
        const data = { title: 'Updated Notebook' };
        mockInstance.put.mockResolvedValue({ data: { id: '123', ...data } });
  
        await client.put('/folders/123', data);
  
        expect(mockInstance.put).toHaveBeenCalledWith(
          '/folders/123',
          data,
          { params: { token } }
        );
      });

    it('should make a DELETE request with the correct token', async () => {
      mockInstance.delete.mockResolvedValue({ data: {} });

      await client.delete('/folders/123');

      expect(mockInstance.delete).toHaveBeenCalledWith('/folders/123', {
        params: { token },
      });
    });
  });
});
