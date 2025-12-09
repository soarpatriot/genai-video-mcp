# GenAI Video MCP Server

An MCP (Model Context Protocol) server that provides video generation capabilities through an AI-powered video generation API.

## Features

- Generate videos from text prompts
- Support for custom AI models
- Configurable aspect ratios (16:9, 9:16, 1:1, etc.)
- Negative prompt support to avoid unwanted elements
- Asynchronous video generation with automatic polling

## Quick Start

### Install from GitHub (Recommended)

Using npx (no installation required):

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "npx",
      "args": ["-y", "github:YOUR_USERNAME/genai-video-mcp"],
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

### Install Locally

1. Clone this repository:

```bash
git clone https://github.com/YOUR_USERNAME/genai-video-mcp.git
cd genai-video-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
VIDEO_API_BASE_URL=http://localhost:3000
VIDEO_API_BEARER_TOKEN=your_actual_bearer_token
```

5. Build the project:

```bash
npm run build
```

**For detailed GitHub setup and installation options, see [GITHUB_SETUP.md](GITHUB_SETUP.md)**

## Usage

### Running the Server

```bash
npm start
```

### Configuration with Claude Desktop

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "node",
      "args": ["/path/to/genai-video-mcp/dist/index.js"],
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

Or if you've installed it globally or want to use the package directly:

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "node",
      "args": ["/absolute/path/to/genai-video-mcp/dist/index.js"],
      "env": {
        "VIDEO_API_BASE_URL": "http://localhost:3000",
        "VIDEO_API_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

## Available Tools

### generate_video

Generate a video using AI based on a text prompt.

**Parameters:**

- `prompt` (required, string): The text description of the video you want to generate
- `model` (optional, string): The AI model to use (default: "veo-3.1-generate-preview")
- `aspectRatio` (optional, string): The aspect ratio of the generated video (e.g., "16:9", "9:16", "1:1")
- `negativePrompt` (optional, string): Things you want to avoid in the generated video

**Example Usage:**

Basic generation:
```
Generate a video: A cinematic shot of a majestic lion in the savannah.
```

With configuration:
```
Generate a video with 16:9 aspect ratio: A serene beach at sunset with waves crashing, avoid people and buildings.
```

With custom model:
```
Generate a video using model veo-3.1-generate-preview: A futuristic cityscape with flying cars.
```

## API Response

The tool returns a JSON response with the following structure:

**Success Response:**
```json
{
  "success": true,
  "videoUrl": "https://your-storage-url.com/videos/generated_video.mp4",
  "storagePath": "videos/generated_video.mp4",
  "prompt": "Your original prompt",
  "operation": {
    "name": "operation-name",
    "done": true,
    "metadata": {}
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Development

### Watch Mode

For development with auto-recompilation:

```bash
npm run watch
```

### Project Structure

```
genai-video-mcp/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VIDEO_API_BASE_URL` | Base URL of the video generation API | No | `http://localhost:3000` |
| `VIDEO_API_BEARER_TOKEN` | Bearer token for API authentication | Yes | - |

## Notes

- Video generation is an asynchronous process that may take several minutes
- The API automatically polls for completion status
- Generated videos are stored and accessible via the returned URL
- Make sure your bearer token has proper permissions for the video generation API

## Troubleshooting

### "VIDEO_API_BEARER_TOKEN environment variable is required"

Make sure you've set the bearer token in your `.env` file or in the Claude Desktop configuration.

### Connection refused

Verify that:
1. The `VIDEO_API_BASE_URL` is correct
2. The API server is running and accessible
3. Your network allows connections to the API endpoint

### Authentication errors

Check that:
1. Your bearer token is valid and not expired
2. The token is correctly formatted in the Authorization header
3. The token has the necessary permissions for video generation

## License

MIT
