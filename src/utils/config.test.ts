import * as fs from 'fs';
import { maskToken, resolveConfig, DEFAULT_BASE_URL } from './config';

jest.mock('fs');
const mockedReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;

describe('Config Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    delete process.env.JOPLIN_API_TOKEN;
    delete process.env.JOPLIN_BASE_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('maskToken', () => {
    it('keeps the first and last 4 characters of a long token', () => {
      expect(maskToken('abcd12345678wxyz')).toBe('abcd********wxyz');
    });

    it('fully masks short tokens', () => {
      expect(maskToken('abcd')).toBe('****');
    });
  });

  describe('resolveConfig', () => {
    it('prefers the --joplin-api-token flag', () => {
      const cfg = resolveConfig({ 'joplin-api-token': 'flagtoken' });
      expect(cfg).toMatchObject({ token: 'flagtoken', tokenSource: 'flag' });
      expect(mockedReadFileSync).not.toHaveBeenCalled();
    });

    it('falls back to the JOPLIN_API_TOKEN env var', () => {
      process.env.JOPLIN_API_TOKEN = 'envtoken';
      const cfg = resolveConfig({});
      expect(cfg).toMatchObject({ token: 'envtoken', tokenSource: 'env' });
    });

    it('falls back to the Joplin desktop settings file', () => {
      mockedReadFileSync.mockReturnValue(JSON.stringify({ 'api.token': 'desktoptoken' }));
      const cfg = resolveConfig({});
      expect(cfg).toMatchObject({ token: 'desktoptoken', tokenSource: 'joplin-desktop' });
    });

    it('reports no token when the settings file is missing', () => {
      mockedReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
      const cfg = resolveConfig({});
      expect(cfg).toMatchObject({ token: null, tokenSource: 'none' });
    });

    it('defaults the base URL when none is provided', () => {
      mockedReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
      const cfg = resolveConfig({});
      expect(cfg.baseUrl).toBe(DEFAULT_BASE_URL);
      expect(cfg.baseUrlSource).toBe('default');
    });

    it('uses the --joplin-base-url flag over the default', () => {
      mockedReadFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
      const cfg = resolveConfig({ 'joplin-base-url': 'http://localhost:9999' });
      expect(cfg).toMatchObject({ baseUrl: 'http://localhost:9999', baseUrlSource: 'flag' });
    });
  });
});
