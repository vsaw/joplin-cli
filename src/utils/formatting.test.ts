import { formatTable, formatNote, formatNotebook } from './formatting';

describe('Formatting Utilities', () => {
  describe('formatTable', () => {
    it('should return "No data found." for empty rows', () => {
      expect(formatTable(['id', 'title'], [])).toBe('No data found.');
    });

    it('should format a table correctly', () => {
      const headers = ['id', 'title'];
      const rows = [
        { id: '1', title: 'Note 1' },
        { id: '2', title: 'Note 2' },
      ];
      const expected = `| id | title |
| --- | --- |
| 1 | Note 1 |
| 2 | Note 2 |`;
      expect(formatTable(headers, rows)).toBe(expected);
    });

    it('should handle missing properties gracefully', () => {
      const headers = ['id', 'title'];
      const rows = [
        { id: '1' }, // Missing title
      ];
      const expected = `| id | title |
| --- | --- |
| 1 |  |`;
      expect(formatTable(headers, rows)).toBe(expected);
    });
  });

  describe('formatNote', () => {
    it('should format a note with title and body', () => {
      const note = { title: 'My Note', body: 'This is the body.' };
      expect(formatNote(note)).toBe('# My Note\n\nThis is the body.');
    });

    it('should format a note without body', () => {
      const note = { title: 'My Note' };
      expect(formatNote(note)).toBe('# My Note\n\n');
    });
  });

  describe('formatNotebook', () => {
    it('should format a notebook title', () => {
      const notebook = { title: 'My Notebook' };
      expect(formatNotebook(notebook)).toBe('# My Notebook');
    });
  });
});
