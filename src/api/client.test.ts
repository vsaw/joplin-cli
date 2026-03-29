import axios, { AxiosInstance } from 'axios';
import { JoplinClient } from './client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JoplinClient', () => {
  const token = 'test-token';
  const baseUrl = 'http://localhost:41184';
  let client: JoplinClient;
  let mockInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockInstance = axios as jest.Mocked<typeof axios>;
    mockedAxios.create.mockReturnValue(mockInstance as AxiosInstance);
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

    it('should allow setting a new token', async () => {
      const newToken = 'new-test-token';
      client.setToken(newToken);
      mockInstance.get.mockResolvedValue({ data: { items: [] } });

      await client.get('/folders');

      expect(mockInstance.get).toHaveBeenCalledWith('/folders', {
        params: { token: newToken },
      });
    });

    it('should allow setting a new base URL', async () => {
        const newBaseUrl = 'http://remote-joplin:41184';
        client.setBaseUrl(newBaseUrl);
        expect(mockInstance.defaults.baseURL).toBe(newBaseUrl);
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
