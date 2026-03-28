# Joplin CLI

A command-line interface for interacting with the Joplin Data API.

Compared to the [Joplin Terminal Application](https://joplinapp.org/help/apps/terminal) this CLI is a thin wrapper of the [Joplin Data API](https://joplinapp.org/help/api/references/rest_api).
It was primarily written to provide a lean alternative over MCP Servers.
Benefits of `joplin-cli` over other MCP Servers are

- **Leaner Code Base** The entire code base is <1k SLOC including tests.
- **Increased Security** Other than MCP Servers this does not depend on any incoming HTTP connection and runs entirely in your command line.
- **Less Token Usage** CLI usage requires much less Context window compared to MCP.
  Watch the [The Pragmatic Engineer interview with Peter Steinberger, creator of Clawdbot and OpenClaw](https://www.youtube.com/watch?v=8lF7HmQ_RgY&t=4908s) or read the excerpt below for more detailed explanation.

    > *Q: In order for this (OpenClaw) to work you want everything to be a CLI. Why CLIs and not MCPs?*
    >
    > A: MCP is a crutch. The best thing that came out of MCP is it made companies rethink to open up more APIs. The whole concept is silly. You have to pre export all the functions of all the tools and all the explanations when your tool loads. And then the model has to send a precise blob of JSON there and gets JSON back. But surprise, models are really good at using bash. Imagine you have a weather service and the model could ask for a list of available cities and get like 500 cities back, and then it picks one city out of that list but it cannot filter that list because that’s not part of how MCP works … and you’d say okay give me the weather for London. And you’d get weather forecast, temperature, wind… and 50 other things I don’t care about because I just want to know "is it raining or not? "But the model needs to digest everything and then you have so much crap in your context.  Whereas if it’s a CLI I could filter for exactly what it needs.  Companies are solving for this but it doesn’t solve the problem that I cannot chain them. I cannot easily build a script that says hey give me all the cities that are over 25 degrees and then filter out only that part of information and pack it in one command. It’s all individual MCP calls I cannot script it.

## Prerequisites

- [Joplin](https://joplinapp.org/) running.
- Joplin Web Clipper (API) enabled.
- API Token obtained from Joplin (Tools > Options > Web Clipper).

## Installation

```bash
npm install -g joplin-cli
```

## Configuration

The following configuration options are evailable

| NAME | REQUIRED | DESCRIPTION |
|--|--|--|
| `JOPLIN_API_TOKEN`<br><br>`--joplin-api-token` | Yes | The required token to connect to the Webclipper API. You can obtain it in the Joplin App settings. For more information see the [Joplin Documentation](https://joplinapp.org/help/api/references/rest_api#authorisation). |
| `JOPLIN_BASE_URL`<br><br>`--joplin-base-url` | No | If not provided http://localhost:41184 will be used as default value. |

The configuration values can be passed via the CLI interface or as environmental variables

For example by adding these lines to your `.bashrc` file

```bash
export JOPLIN_API_TOKEN=your_token_here
# Optional: Set the base URL if different from default
# export JOPLIN_BASE_URL=http://localhost:41184
```

Alternatively you can set it via an `.env` file

```env
JOPLIN_API_TOKEN=your_token_here
```

## Usage

```bash
joplin-cli <command> [options]
```

### General Commands

#### Ping
Test the connection to the Joplin Data API.

```bash
joplin-cli ping
```

#### Search
Search for notes (alias for `joplin-cli note search`).

```bash
joplin-cli search "My Note"
joplin-cli search "title:MyNote" --complex
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
joplin-cli notebook list
```

Get details of a specific notebook by ID.

```bash
joplin-cli notebook get <id>
```

Search for notebooks by title. By default, it uses wildcards (e.g., `*query*`) for partial matching.

```bash
joplin-cli notebook search "My Notebook"
```

Use the `--complex` (or `-c`) flag to use full [Joplin search operators](https://joplinapp.org/help/apps/search).

```bash
joplin-cli notebook search "title:MyNotebook" --complex
```

Create a new notebook.

```bash
joplin-cli notebook create "My Notebook"
```

Update a notebook's title.

```bash
joplin-cli notebook update <id> --title "New Title"
```

Delete a notebook.

```bash
joplin-cli notebook delete <id>
```

### Note Commands

Interact with notes.

List notes. Optionally filter by notebook.

```bash
joplin-cli note list
joplin-cli note list --notebook <notebook_id>
```

Search for notes by title. By default, it uses wildcards (e.g., `*query*`) for partial matching.

```bash
joplin-cli note search "My Note"
```

Use the `--complex` (or `-c`) flag to use full Joplin search operators.

```bash
joplin-cli note search "title:MyNote" --complex
```

Get the content and metadata of a note.

```bash
joplin-cli note get <id>
```

Create a new note.

```bash
joplin-cli note create "My Note Title" --notebook <notebook_id> --body "This is the note body"
```

Update a note's title or body.

```bash
joplin-cli note update <id> --title "Updated Title" --body "Updated body content"
```

Delete a note.

```bash
joplin-cli note delete <id>
```

## Development

1. Clone the repository.
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
