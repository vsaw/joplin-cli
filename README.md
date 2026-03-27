# Joplin CLI

A command-line interface for interacting with the Joplin Data API.

Compared to the [Joplin Terminal Application](https://joplinapp.org/help/apps/terminal) this CLI is a thin wrapper of the [Joplin Data API](https://joplinapp.org/help/api/references/rest_api).

## Prerequisites

- [Joplin](https://joplinapp.org/) running locally.
- Joplin Web Clipper (API) enabled.
- API Token obtained from Joplin (Tools > Options > Web Clipper).

## Installation

```bash
npm install -g joplin-cli
```

## Configuration

Set the `JOPLIN_API_TOKEN` environment variable:

```bash
export JOPLIN_API_TOKEN=your_token_here
# Optional: Set the base URL if different from default
# export JOPLIN_BASE_URL=http://localhost:41184
```

Alternatively you can set it via an `.env` file

```
JOPLIN_API_TOKEN=your_token_here
```

## Usage

```bash
joplin <command> [options]
```

### General Commands

#### Ping
Test the connection to the Joplin Data API.

```bash
joplin ping
```

#### Search
Search for notes (alias for `joplin note search`).

```bash
joplin search "My Note"
joplin search "title:MyNote" --complex
```

### Global Options

- `--help`: Show help
- `--version`: Show version number
- `--sandbox`, `-s`: Run in sandbox mode (no changes will be made to Joplin data)
- `--verbose`, `-v`: Show debug information (requests/responses)

### Notebook Commands

Interact with notebooks (folders).

List all notebooks.

```bash
joplin notebook list
```

Get details of a specific notebook by ID.

```bash
joplin notebook get <id>
```

Search for notebooks by title. By default, it uses wildcards (e.g., `*query*`) for partial matching.

```bash
joplin notebook search "My Notebook"
```

Use the `--complex` (or `-c`) flag to use full Joplin search operators.

```bash
joplin notebook search "title:MyNotebook" --complex
```

Create a new notebook.

```bash
joplin notebook create "My Notebook"
```

Update a notebook's title.

```bash
joplin notebook update <id> --title "New Title"
```

Delete a notebook.

```bash
joplin notebook delete <id>
```

### Note Commands

Interact with notes.

List notes. Optionally filter by notebook.

```bash
joplin note list
joplin note list --notebook <notebook_id>
```

Search for notes by title. By default, it uses wildcards (e.g., `*query*`) for partial matching.

```bash
joplin note search "My Note"
```

Use the `--complex` (or `-c`) flag to use full Joplin search operators.

```bash
joplin note search "title:MyNote" --complex
```

Get the content and metadata of a note.

```bash
joplin note get <id>
```

Create a new note.

```bash
joplin note create "My Note Title" --notebook <notebook_id> --body "This is the note body"
```

Update a note's title or body.

```bash
joplin note update <id> --title "Updated Title" --body "Updated body content"
```

Delete a note.

```bash
joplin note delete <id>
```

## Development

1. Clone the repository.
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
