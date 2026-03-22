#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { JoplinClient } from './api/client';
import { listNotebooks, getNotebook, createNotebook, updateNotebook, deleteNotebook } from './commands/notebooks';
import { listNotes, getNote, createNote, updateNote, deleteNote } from './commands/notes';
import { formatTable, formatNote, formatNotebook } from './utils/formatting';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

const token = process.env.JOPLIN_API_TOKEN;
const baseUrl = process.env.JOPLIN_BASE_URL || 'http://localhost:41184';

const client = new JoplinClient(token || '', baseUrl);

yargs(hideBin(process.argv))
  .scriptName('joplin')
  .usage('$0 <cmd> [args]')
  .option('sandbox', { alias: 's', type: 'boolean', default: false, describe: 'Run in sandbox mode (no changes will be made)' })
  .option('verbose', { alias: 'v', type: 'boolean', default: false, describe: 'Show debug information' })
  .middleware((argv) => {
    // Check for token only if we're not just showing help or version
    if (!argv.help && !argv.version && !token) {
      console.error('Error: JOPLIN_API_TOKEN environment variable is not set.');
      process.exit(1);
    }
    client.setVerbose(argv.verbose as boolean);
  })
  
  // General Commands
  .command('ping', 'Test connection to Joplin Data API', {}, async () => {
    try {
      const result = await client.get('/ping');
      console.log(`Joplin Data API is reachable (Status: ${result})`);
    } catch (error: any) {
      console.error('Error connecting to Joplin Data API:', error.message);
    }
  })

  // Notebook Commands
  .command('notebook <command>', 'Manage notebooks', (yargs) => {
    return yargs
      .command('list', 'List all notebooks', {}, async () => {
        try {
          const notebooks = await listNotebooks(client);
          console.log(formatTable(['id', 'title'], notebooks));
        } catch (error: any) {
          console.error('Error listing notebooks:', error.message);
        }
      })
      .command('get <id>', 'Get a notebook', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Notebook ID' });
      }, async (argv) => {
        try {
          const notebook = await getNotebook(client, argv.id as string);
          console.log(formatNotebook(notebook));
        } catch (error: any) {
          console.error(`Error getting notebook ${argv.id}:`, error.message);
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
        } catch (error: any) {
          console.error('Error creating notebook:', error.message);
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
        } catch (error: any) {
          console.error(`Error updating notebook ${argv.id}:`, error.message);
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
        } catch (error: any) {
          console.error(`Error deleting notebook ${argv.id}:`, error.message);
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
        } catch (error: any) {
          console.error('Error listing notes:', error.message);
        }
      })
      .command('get <id>', 'Get a note', (yargs) => {
        return yargs.positional('id', { type: 'string', describe: 'Note ID' });
      }, async (argv) => {
        try {
          const note = await getNote(client, argv.id as string);
          console.log(formatNote(note));
        } catch (error: any) {
          console.error(`Error getting note ${argv.id}:`, error.message);
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
        } catch (error: any) {
          console.error('Error creating note:', error.message);
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
          const updates: any = {};
          if (argv.title) updates.title = argv.title;
          if (argv.body) updates.body = argv.body;
          
          if (Object.keys(updates).length === 0) {
            console.warn('No updates provided.');
            return;
          }

          const note = await updateNote(client, argv.id as string, updates);
          console.log('Note updated:', note.id);
        } catch (error: any) {
          console.error(`Error updating note ${argv.id}:`, error.message);
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
        } catch (error: any) {
          console.error(`Error deleting note ${argv.id}:`, error.message);
        }
      });
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .parse();
