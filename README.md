# GenAI Video MCP Server

MCP server that provides AI-powered video generation capabilities through integration with video generation APIs.

## Features

- Text-to-video generation with customizable prompts
- Image-to-video animation
- Video extension and interpolation
- Reference image support for style/content guidance
- Configurable aspect ratios (16:9, 9:16) and resolutions (720p, 1080p)
- Automatic polling for asynchronous video generation
- File download from Supabase storage

## Installation

### Option 1: NPX (Recommended)

Add to your Claude Desktop config:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "npx",
      "args": ["-y", "github:YOUR_USERNAME/genai-video-mcp"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your_supabase_anon_key",
        "SUPABASE_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```

### Option 2: Local Installation

```bash
git clone https://github.com/YOUR_USERNAME/genai-video-mcp.git
cd genai-video-mcp
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

Claude Desktop config for local installation:

```json
{
  "mcpServers": {
    "genai-video": {
      "command": "node",
      "args": ["/absolute/path/to/genai-video-mcp/src/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your_supabase_anon_key",
        "SUPABASE_BEARER_TOKEN": "your_bearer_token_here"
      }
    }
  }
}
```


## MCP Server Tools

This server exposes two tools through the Model Context Protocol:

### generate_video

An asynchronous video generation tool that sends requests to the AI video API and polls for completion. The server makes a POST request to `{SUPABASE_URL}/functions/v1/ai-service/videos` with the provided parameters.

**How it works:**
1. Constructs a request with the prompt, model, and configuration parameters
2. Sends authenticated request using the bearer token
3. Returns the video URL, storage path, and operation metadata on success
4. Handles errors and provides detailed error messages

**Core Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | string | *required* | Text description of the video |
| `model` | string | `veo-3.1-generate-preview` | AI model to use |
| `aspectRatio` | string | `16:9` | Options: `16:9`, `9:16` |
| `resolution` | string | `720p` | Options: `720p`, `1080p` (1080p requires 8s duration) |
| `durationSeconds` | number | - | Options: 4, 5, 6, 8 (8 required for extension/interpolation) |
| `negativePrompt` | string | - | Elements to avoid in generation |
| `personGeneration` | string | - | `allow_all` (text-to-video), `allow_adult` (image-to-video), `dont_allow` |

**Generation Modes:**

| Mode | Parameters | Description |
|------|------------|-------------|
| Text-to-video | `prompt` only | Generate video from text description |
| Image-to-video | `image` + `prompt` | Animate a static image (requires `imageBytes`/`gcsUri` + `mimeType`) |
| Video interpolation | `image` + `lastFrame` + `prompt` | Create transition between two images |
| Video extension | `video` + `prompt` | Extend an existing video (requires `videoBytes`/`gcsUri` + `mimeType`) |
| Reference-guided | `referenceImages` + `prompt` | Use up to 3 reference images for style/content (Veo 3.1 only) |

**Response Format:**
```json
{
  "success": true,
  "videoUrl": "https://storage-url/video.mp4",
  "storagePath": "path/in/storage.mp4",
  "prompt": "original prompt",
  "operation": {
    "name": "operation-id",
    "done": true,
    "metadata": {}
  }
}
```

**Example:**
```
Generate a 16:9 video: A cinematic shot of a majestic lion in the savannah, avoid people and buildings
```

### download_file

Downloads files from Supabase storage buckets and automatically saves them to a local `videos` directory.

**How it works:**
1. Connects to Supabase using the configured URL and API key
2. Downloads the file as a blob from the specified bucket and path
3. Converts the blob to a base64 string for transmission
4. Creates a `videos` directory in the current working directory if it doesn't exist
5. Saves the file locally with its original filename
6. Returns metadata including the local path and base64 data

**Parameters:**
- `bucketName` (required): Supabase storage bucket name
- `filePath` (required): Full path to file in bucket (e.g., `videos/output.mp4`)

**Response Format:**
```json
{
  "success": true,
  "fileName": "output.mp4",
  "filePath": "videos/output.mp4",
  "localPath": "/absolute/path/to/videos/output.mp4",
  "size": 1234567,
  "type": "video/mp4",
  "data": "base64encodedstring..."
}
```

**Example:**
```
Download file from bucket 'my-videos' at path 'generated/video.mp4'
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL (e.g., `https://your-project.supabase.co`) |
| `SUPABASE_BEARER_TOKEN` | Yes | Bearer token for video generation API |
| `SUPABASE_KEY` | No* | Anon/public key (only required for `download_file` tool) |

*The `generate_video` tool only requires `SUPABASE_URL` and `SUPABASE_BEARER_TOKEN`.

### Important Notes

- Video generation is asynchronous and may take several minutes
- The server automatically polls for completion status
- Ensure your bearer token has proper permissions for the video generation API

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing environment variables | Set `SUPABASE_URL`, `SUPABASE_BEARER_TOKEN` (and `SUPABASE_KEY` for downloads) in `.env` or Claude Desktop config |
| Connection refused | Verify `SUPABASE_URL` is correct and Supabase project is accessible |
| Authentication errors | Check bearer token validity, format, and permissions |

## License

MIT
