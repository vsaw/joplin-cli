# Joplin CLI

A command-line interface for interacting with the Joplin Data API.

Compared to the [Joplin Terminal Application](https://joplinapp.org/help/apps/terminal) this CLI is a thin wrapper of the [Joplin Data API](https://joplinapp.org/help/api/references/rest_api).
It was primarily written to provide a lean alternative over MCP Servers.
Benefits of `joplin-cli` over other MCP Servers are

- **Leaner Code Base** The entire code base is ~500 SLOC including tests.
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
npm install -g github:vsaw/joplin-cli
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

The following are global options that can be added to any command.

- `--help`: Show help
- `--version`: Show version number
- `--sandbox`, `-s`: Run in sandbox mode (no changes will be made to Joplin data)
- `--verbose`, `-v`: Show debug information (requests/responses).
  WARNING: This will show your `JOPLIN_API_TOKEN`.

### Quickstart

For a full list of option you can use `--help` at any point, e.g. to learn more about updating notes use `joplin-cli note update --help`.

### Working with notes

```bash
# Search for all Notes containing "joplin" in title or body
$ joplin-cli note search "joplin"

# Search for all Notes with exact title "MyNote", created in the last two days
# See Joplin Search Syntax for how to use complex queries.
$ joplin-cli note search "title:MyNote created:day-2" --complex

# List all notes
$ joplin-cli note list [--notebook <Notebook ID>]

# Get Note content
$ joplin-cli note get <ID>

# Create a new Note in specified Notebook
# If Body is ommited, an empty note will be created.
$ joplin-cli note create "Title" --notebook <Notebook ID> [--body <Body>]

# Update a note
# Either --title or --body must be present. Updates will overwrit existing note content
$ joplin-cli note update update [--title <New Title>] [--body <New Body>]

# Delete a note
$ joplin-cli note delete <id>
```

### Working with Notebooks

```bash
# Search for all Notes containing "joplin" in title or body
$ joplin-cli notebook search "joplin"

# Search for all Notes with exact title "MyNote", created in the last two days
# See Joplin Search Syntax for how to use complex queries.
$ joplin-cli notebook search "title:MyNote created:day-2" --complex

# List all Notebooks
$ joplin-cli notebook list

# Create a new Notebook
$ joplin-cli notebook create "My Notebook"

# Update a Notebook Title
$ joplin-cli notebook update <id> --title <New Title>

# Delete a Notebook and all Notes it contains
$ joplin-cli notebook delete <id>
```

### Troubleshooting

To test if `joplin-cli` can reach Joplin at `JOPLIN_BASE_URL` you can use the `ping` command.

```bash
$ joplin-cli ping
Joplin Data API is reachable (Status: JoplinClipperServer)

OR

Error connecting to Joplin Data API: Failed to connect to Joplin API at http://localhost:123. Please ensure the Joplin is running and the Web Clipper API is enabled.
```

To test and debug if the API Token was correctly set use `note list --verbose`.

```bash
# List all Notes and show debug information on the Joplin Data API request and response
$ joplin-cli note list --verbose

[VERBOSE] GET http://localhost:41184/notes?token=XXxxXXxxXXxxXXxxXX
[VERBOSE] PARAMS: {
  "token": "XXxxXXxxXXxxXXxxXX"
}
[VERBOSE] RESPONSE 200: {
  "items": [
    {
      "id": "edba4925cf86485588209bd1f2302ded",
      "parent_id": "c1d874c248034e41ac9f8477359c0b6f",
      "title": "My Note",
      "deleted_time": 0
    },
    ...
| id | title |
| --- | --- |
| edba4925cf86485588209bd1f2302ded | My Note |
```

## Development

1. Clone the repository.
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
