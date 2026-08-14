import { formatTable, formatNote, formatNotebook, formatTag } from './formatting';
import { Note } from '../commands/notes';
import { Notebook } from '../commands/notebooks';
import { Tag } from '../commands/tags';

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
      const rows: Note[] = [
        {
          id: '1',
          title: '',
          body: '',
          parent_id: ''
        }, // Missing title
      ];
      const expected = `| id | title |
| --- | --- |
| 1 |  |`;
      expect(formatTable(headers, rows)).toBe(expected);
    });
  });

  describe('formatNote', () => {
    it('should format a note with title and body', () => {
      const note: Note = {
        title: 'My Note', body: 'This is the body.',
        id: '',
        parent_id: ''
      };
      expect(formatNote(note)).toBe('# My Note\n\nThis is the body.');
    });

    it('should format a note without body', () => {
      const note: Note = {
        title: 'My Note',
        body: '',
        id: '',
        parent_id: ''
      };
      expect(formatNote(note)).toBe('# My Note\n\n');
    });

    it('should not duplicate the title when the body already starts with it', () => {
      const note: Note = {
        title: 'My Note',
        body: '# My Note\n\nAlready has a heading.',
        id: '',
        parent_id: ''
      };
      expect(formatNote(note)).toBe('# My Note\n\nAlready has a heading.');
    });
  });

  describe('formatNote with front matter', () => {
    const note: Note = {
      id: '1',
      title: 'Weekly Review',
      body: 'Body text here.',
      parent_id: ''
    };

    it('should not emit front matter by default', () => {
      expect(formatNote(note)).toBe('# Weekly Review\n\nBody text here.');
    });

    it('should separate multiple tags with a comma', () => {
      const tags: Tag[] = [
        { id: 't1', title: 'work' },
        { id: 't2', title: 'planning' },
        { id: 't3', title: 'q3' },
      ];
      const expected = `---
title: Weekly Review
tags: work, planning, q3
---

Body text here.`;
      expect(formatNote(note, true, tags)).toBe(expected);
    });

    it('should omit the tags key when the note has no tags', () => {
      const expected = `---
title: Weekly Review
---

Body text here.`;
      expect(formatNote(note, true, [])).toBe(expected);
    });

    it('should omit the tags key when no tags are passed', () => {
      const expected = `---
title: Weekly Review
---

Body text here.`;
      expect(formatNote(note, true)).toBe(expected);
    });

    it('should quote a title containing a colon', () => {
      const tricky: Note = {
        id: '1',
        title: 'Meeting: Q3 planning',
        body: 'Body.',
        parent_id: ''
      };
      const expected = `---
title: "Meeting: Q3 planning"
tags: work
---

Body.`;
      expect(formatNote(tricky, true, [{ id: 't1', title: 'work' }])).toBe(expected);
    });

    it('should not inject a title heading into the body', () => {
      const result = formatNote(note, true, []);
      expect(result).not.toContain('# Weekly Review');
    });

    it('should handle a note with an empty body', () => {
      const empty: Note = {
        id: '1',
        title: 'Weekly Review',
        body: '',
        parent_id: ''
      };
      const expected = `---
title: Weekly Review
---

`;
      expect(formatNote(empty, true, [])).toBe(expected);
    });
  });

  describe('formatNotebook', () => {
    it('should format a notebook title', () => {
      const notebook: Notebook = {
        title: 'My Notebook',
        id: ''
      };
      expect(formatNotebook(notebook)).toBe('# My Notebook');
    });
  });

  describe('formatTag', () => {
    it('should format a tag title', () => {
      const tag: Tag = {
        title: 'My Tag',
        id: ''
      };
      expect(formatTag(tag)).toBe('# My Tag');
    });
  });
});
