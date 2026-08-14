#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { JoplinClient } from './api/client';
import { listNotebooks, getNotebook, createNotebook, updateNotebook, deleteNotebook, searchNotebooks } from './commands/notebooks';
import { listNotes, getNote, createNote, updateNote, deleteNote, searchNotes } from './commands/notes';
import { listTags, getTag, createTag, updateTag, deleteTag, searchTags, listTagNotes, listNoteTags, addTagToNote, removeTagFromNote } from './commands/tags';
import { formatTable, formatNote, formatNotebook, formatTag } from './utils/formatting';
import { resolveConfig, maskToken, desktopSettingsPath } from './utils/config';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

const client = new JoplinClient(process.env.JOPLIN_API_TOKEN || '', process.env.JOPLIN_BASE_URL || 'http://localhost:41184');

yargs(hideBin(process.argv))
  .scriptName('joplin')
  .usage('$0 <cmd> [args]')
  .option('joplin-api-token', { type: 'string', describe: 'Joplin API Token' })
  .option('joplin-base-url', { type: 'string', describe: 'Joplin Base URL' })
  .option('sandbox', { alias: 's', type: 'boolean', default: false, describe: 'Run in sandbox mode (no changes will be made)' })
  .option('verbose', { alias: 'v', type: 'boolean', default: false, describe: 'Show debug information' })
  .middleware((argv) => {
    const { token, baseUrl } = resolveConfig(argv);

    // A token isn't required to show help/version or to run `config` (which reports config state).
    if (!argv.help && !argv.version && !argv._.includes('config') && !token) {
      console.error('Error: No Joplin API token found. Enable the Web Clipper in Joplin (its token is read from the desktop settings), pass --joplin-api-token, or set JOPLIN_API_TOKEN. Run the `config` command to see what was detected.');
      process.exit(1);
    }
    if (token) {
      client.setToken(token);
    }
    client.setBaseUrl(baseUrl);
    client.setVerbose(argv.verbose as boolean);
  })
  
  // General Commands
  .command('ping', 'Test connection to Joplin Data API', {}, async () => {
    try {
      const result = await client.get('/ping');
      console.log(`Joplin Data API is reachable (Status: ${result})`);
    } catch (error: unknown) {
      console.error('Error connecting to Joplin Data API:', error instanceof Error ? error.message : String(error));
    }
  })
  .command('search <query>', 'Search for notes (Alias for note search)', (yargs) => {
    return yargs
      .positional('query', { type: 'string', describe: 'Search query' })
      .option('complex', { alias: 'c', type: 'boolean', default: false, describe: 'Use complex search operators' });
  }, async (argv) => {
    try {
      const notes = await searchNotes(client, argv.query as string, argv.complex as boolean);
      console.log(formatTable(['id', 'title'], notes));
    } catch (error: unknown) {
      console.error('Error searching notes:', error instanceof Error ? error.message : String(error));
    }
  })
  .command('config', 'Show the resolved configuration (base URL and API token)', (yargs) => {
    return yargs.option('show', { type: 'boolean', default: false, describe: 'Reveal the full API token instead of masking it' });
  }, (argv) => {
    const cfg = resolveConfig(argv);
    const tokenDisplay = cfg.token
      ? (argv.show ? cfg.token : maskToken(cfg.token))
      : '(not set)';
    console.log(`Base URL:  ${cfg.baseUrl}  (${cfg.baseUrlSource})`);
    console.log(`API token: ${tokenDisplay}  (${cfg.tokenSource})`);
    if (cfg.tokenSource === 'none') {
      console.log(`\nNo API token found. Enable the Web Clipper in Joplin (Tools > Options > Web Clipper);`);
      console.log(`its token is then read automatically from ${desktopSettingsPath()}.`);
      console.log(`You can also pass --joplin-api-token or set JOPLIN_API_TOKEN.`);
    }
  })

  // Notebook Commands
  .command('notebook <command>', 'Manage notebooks', (yargs) => {
    return yargs
      .command('list', 'List all notebooks', {}, async () => {
        try {
          const notebooks = await listNotebooks(client);
          console.log(formatTable(['id', 'title'], notebooks));
        } catch (error: unknown) {
          console.error('Error listing notebooks:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('search <query>', 'Search for notebooks by title', (yargs) => {
        return yargs
          .positional('query', { type: 'string', describe: 'Search query' })
          .option('complex', { alias: 'c', type: 'boolean', default: false, describe: 'Use complex search operators' });
      }, async (argv) => {
        try {
          console.debug('Search query:', argv.query);
          console.debug('Complex search:', argv.complex);
          const notebooks = await searchNotebooks(client, argv.query as string, argv.complex as boolean);
          console.log(formatTable(['id', 'title'], notebooks));
        } catch (error: unknown) {
          console.error('Error searching notebooks:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('get <id>', 'Get a notebook', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Notebook ID' });
      }, async (argv) => {
        try {
          const notebook = await getNotebook(client, argv.id as string);
          console.log(formatNotebook(notebook));
        } catch (error: unknown) {
          console.error(`Error getting notebook ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('create <title>', 'Create a notebook', (yargs) => {
        return yargs.positional('title', { type: 'string', describe: 'Notebook title' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip notebook creation:', argv.title);
          return;
        }
        try {
          const notebook = await createNotebook(client, argv.title as string);
          console.log('Notebook created:', notebook.id);
        } catch (error: unknown) {
          console.error('Error creating notebook:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('update <id>', 'Update a notebook', (yargs) => {
        return yargs
          .positional('id', { type: 'string', describe: 'Notebook ID' })
          .option('title', { type: 'string', demandOption: true, describe: 'New title' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip notebook update:', argv.id);
          return;
        }
        try {
          const notebook = await updateNotebook(client, argv.id as string, argv.title as string);
          console.log('Notebook updated:', notebook.id);
        } catch (error: unknown) {
          console.error(`Error updating notebook ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('delete <id>', 'Delete a notebook', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Notebook ID' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip notebook deletion:', argv.id);
          return;
        }
        try {
          await deleteNotebook(client, argv.id as string);
          console.log(`Notebook ${argv.id} deleted.`);
        } catch (error: unknown) {
          console.error(`Error deleting notebook ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      });
  })

  // Note Commands
  .command('note <command>', 'Manage notes', (yargs) => {
    return yargs
      .command('list', 'List notes', (yargs) => {
        return yargs.option('notebook', { alias: 'n', type: 'string', describe: 'Filter by notebook ID' });
      }, async (argv) => {
        try {
          const notes = await listNotes(client, argv.notebook as string);
          console.log(formatTable(['id', 'title'], notes));
        } catch (error: unknown) {
          console.error('Error listing notes:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('search <query>', 'Search for notes', (yargs) => {
        return yargs
          .positional('query', { type: 'string', describe: 'Search query' })
          .option('complex', { alias: 'c', type: 'boolean', default: false, describe: 'Use complex search operators' });
      }, async (argv) => {
        try {
          const notes = await searchNotes(client, argv.query as string, argv.complex as boolean);
          console.log(formatTable(['id', 'title'], notes));
        } catch (error: unknown) {
          console.error('Error searching notes:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('get <id>', 'Get a note', (yargs) => {
        return yargs
          .positional('id', { type: 'string', describe: 'Note ID' })
          .option('front-matter', { type: 'boolean', default: false, describe: 'Prepend YAML front matter with title and tags' });
      }, async (argv) => {
        try {
          const note = await getNote(client, argv.id as string);
          console.log(formatNote(note, argv.frontMatter as boolean));
        } catch (error: unknown) {
          console.error(`Error getting note ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('create <title>', 'Create a note', (yargs) => {
        return yargs
          .positional('title', { type: 'string', describe: 'Note title' })
          .option('notebook', { alias: 'n', type: 'string', demandOption: true, describe: 'Notebook ID' })
          .option('body', { alias: 'b', type: 'string', default: '', describe: 'Note body' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip note creation:', argv.title);
          return;
        }
        try {
          const note = await createNote(client, argv.title as string, argv.body as string, argv.notebook as string);
          console.log('Note created:', note.id);
        } catch (error: unknown) {
          console.error('Error creating note:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('update <id>', 'Update a note', (yargs) => {
        return yargs
          .positional('id', { type: 'string', describe: 'Note ID' })
          .option('title', { type: 'string', describe: 'New title' })
          .option('body', { type: 'string', describe: 'New body' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip note update:', argv.id);
          return;
        }
        try {
          const updates: { title?: string; body?: string } = {};
          if (argv.title) updates.title = argv.title as string;
          if (argv.body) updates.body = argv.body as string;
          
          if (Object.keys(updates).length === 0) {
            console.warn('No updates provided.');
            return;
          }

          const note = await updateNote(client, argv.id as string, updates);
          console.log('Note updated:', note.id);
        } catch (error: unknown) {
          console.error(`Error updating note ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('delete <id>', 'Delete a note', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Note ID' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip note deletion:', argv.id);
          return;
        }
        try {
          await deleteNote(client, argv.id as string);
          console.log(`Note ${argv.id} deleted.`);
        } catch (error: unknown) {
          console.error(`Error deleting note ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('tags <id>', 'List the tags of a note', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Note ID' });
      }, async (argv) => {
        try {
          const tags = await listNoteTags(client, argv.id as string);
          console.log(formatTable(['id', 'title'], tags));
        } catch (error: unknown) {
          console.error(`Error listing tags of note ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('tag <id>', 'Add a tag to a note', (yargs) => {
        return yargs
          .positional('id', { type: 'string', describe: 'Note ID' })
          .option('tag', { type: 'string', demandOption: true, describe: 'Tag ID' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip tagging note:', argv.id);
          return;
        }
        try {
          await addTagToNote(client, argv.tag as string, argv.id as string);
          console.log(`Tag ${argv.tag} added to note ${argv.id}.`);
        } catch (error: unknown) {
          console.error(`Error adding tag ${argv.tag} to note ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('untag <id>', 'Remove a tag from a note', (yargs) => {
        return yargs
          .positional('id', { type: 'string', describe: 'Note ID' })
          .option('tag', { type: 'string', demandOption: true, describe: 'Tag ID' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip untagging note:', argv.id);
          return;
        }
        try {
          await removeTagFromNote(client, argv.tag as string, argv.id as string);
          console.log(`Tag ${argv.tag} removed from note ${argv.id}.`);
        } catch (error: unknown) {
          console.error(`Error removing tag ${argv.tag} from note ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      });
  })

  // Tag Commands
  .command('tag <command>', 'Manage tags', (yargs) => {
    return yargs
      .command('list', 'List all tags', {}, async () => {
        try {
          const tags = await listTags(client);
          console.log(formatTable(['id', 'title'], tags));
        } catch (error: unknown) {
          console.error('Error listing tags:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('search <query>', 'Search for tags by title', (yargs) => {
        return yargs.positional('query', { type: 'string', describe: 'Search query' });
      }, async (argv) => {
        try {
          const tags = await searchTags(client, argv.query as string);
          console.log(formatTable(['id', 'title'], tags));
        } catch (error: unknown) {
          console.error('Error searching tags:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('get <id>', 'Get a tag', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Tag ID' });
      }, async (argv) => {
        try {
          const tag = await getTag(client, argv.id as string);
          console.log(formatTag(tag));
        } catch (error: unknown) {
          console.error(`Error getting tag ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('notes <id>', 'List the notes carrying a tag', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Tag ID' });
      }, async (argv) => {
        try {
          const notes = await listTagNotes(client, argv.id as string);
          console.log(formatTable(['id', 'title'], notes));
        } catch (error: unknown) {
          console.error(`Error listing notes of tag ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('create <title>', 'Create a tag', (yargs) => {
        return yargs.positional('title', { type: 'string', describe: 'Tag title' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip tag creation:', argv.title);
          return;
        }
        try {
          const tag = await createTag(client, argv.title as string);
          console.log('Tag created:', tag.id);
        } catch (error: unknown) {
          console.error('Error creating tag:', error instanceof Error ? error.message : String(error));
        }
      })
      .command('update <id>', 'Update a tag', (yargs) => {
        return yargs
          .positional('id', { type: 'string', describe: 'Tag ID' })
          .option('title', { type: 'string', demandOption: true, describe: 'New title' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip tag update:', argv.id);
          return;
        }
        try {
          const tag = await updateTag(client, argv.id as string, argv.title as string);
          console.log('Tag updated:', tag.id);
        } catch (error: unknown) {
          console.error(`Error updating tag ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      })
      .command('delete <id>', 'Delete a tag', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Tag ID' });
      }, async (argv) => {
        if (argv.sandbox) {
          console.log('[SANDBOX] Skip tag deletion:', argv.id);
          return;
        }
        try {
          await deleteTag(client, argv.id as string);
          console.log(`Tag ${argv.id} deleted.`);
        } catch (error: unknown) {
          console.error(`Error deleting tag ${argv.id}:`, error instanceof Error ? error.message : String(error));
        }
      });
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .parse();
