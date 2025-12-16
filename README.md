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
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your_supabase_anon_key",
        "SUPABASE_BEARER_TOKEN": "your_bearer_token_here"
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
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BEARER_TOKEN=your_actual_bearer_token
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
      "args": ["/path/to/genai-video-mcp/src/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_KEY": "your_supabase_anon_key",
        "SUPABASE_BEARER_TOKEN": "your_bearer_token_here"
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

## Available Tools

### generate_video

Generate a video using AI based on a text prompt. Supports text-to-video, image-to-video, video interpolation, video extension, and reference images for style/content guidance.

**Parameters:**

- `prompt` (required, string): The text description of the video you want to generate
- `model` (optional, string): The AI model to use (default: "veo-3.1-generate-preview")
- `aspectRatio` (optional, string): The aspect ratio of the generated video. Options: "16:9" (default, 720p & 1080p), "9:16" (720p & 1080p)
- `negativePrompt` (optional, string): Things you want to avoid in the generated video
- `resolution` (optional, string): The resolution of the generated video. Options: "720p" (default), "1080p" (only supports 8s duration)
- `durationSeconds` (optional, number): Length of the generated video in seconds. Options: 4, 5, 6, or 8. Must be 8 when using extension/interpolation or referenceImages (16:9 only)
- `personGeneration` (optional, string): Controls the generation of people. Options: "allow_all", "allow_adult", "dont_allow"
- `image` (optional, object): An initial image to animate (Image-to-video). Provide either imageBytes (base64) or gcsUri
  - `imageBytes` (string): Base64 encoded image data
  - `gcsUri` (string): GCS URI for the image (gs://...)
  - `mimeType` (string): MIME type of the image (e.g., image/png)
- `lastFrame` (optional, object): The final image for an interpolation video. Must be used with the image parameter
  - `imageBytes` (string): Base64 encoded image data
  - `gcsUri` (string): GCS URI for the image (gs://...)
  - `mimeType` (string): MIME type of the image
- `referenceImages` (optional, array): Up to three images to be used as style and content references (Veo 3.1 only)
  - Each item contains:
    - `image` (object): Image data with imageBytes/gcsUri and mimeType
    - `referenceType` (string): Reference type (style or content)
- `video` (optional, object): Video to be used for video extension. Provide either videoBytes (base64) or gcsUri
  - `videoBytes` (string): Base64 encoded video data
  - `gcsUri` (string): GCS URI for the video (gs://...)
  - `mimeType` (string): MIME type of the video (e.g., video/mp4)

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

### download_file

Download a file from Supabase storage. Returns the file data as base64 encoded string along with metadata. The file is automatically saved to a `videos` directory in the current working directory.

**Parameters:**

- `bucketName` (required, string): The name of the Supabase storage bucket
- `filePath` (required, string): The path to the file in the bucket (e.g., 'path/to/file.ext')

**Returns:**

- `success` (boolean): Whether the download was successful
- `fileName` (string): Name of the downloaded file
- `filePath` (string): Original path in the bucket
- `localPath` (string): Local path where the file was saved
- `size` (number): Size of the file
- `type` (string): MIME type of the file
- `data` (string): Base64 encoded file data

**Example Usage:**

```
Download the video file from bucket 'videos' at path 'generated/video.mp4'
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

### Project Structure

```
genai-video-mcp/
├── src/
│   └── index.js          # Main MCP server implementation
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Base URL of your Supabase project (e.g., https://your-project.supabase.co) | Yes | - |
| `SUPABASE_KEY` | Supabase anon/public key (required for download_file tool) | No* | - |
| `SUPABASE_BEARER_TOKEN` | Bearer token for API authentication (used for video generation) | Yes | - |

\* `SUPABASE_KEY` is only required if you want to use the `download_file` tool to download files from Supabase storage. The `generate_video` tool only requires `SUPABASE_URL` and `SUPABASE_BEARER_TOKEN`.

## Notes

- Video generation is an asynchronous process that may take several minutes
- The API automatically polls for completion status
- Generated videos are stored and accessible via the returned URL
- Make sure your bearer token has proper permissions for the video generation API

## Troubleshooting

### "SUPABASE_BEARER_TOKEN environment variable is required"

Make sure you've set the bearer token in your `.env` file or in the Claude Desktop configuration.

### "SUPABASE_URL environment variable is required"

Make sure you've set the Supabase URL in your `.env` file or in the Claude Desktop configuration.

### Connection refused

Verify that:
1. The `SUPABASE_URL` is correct and includes the full URL (e.g., https://your-project.supabase.co)
2. The Supabase project is accessible
3. Your network allows connections to the Supabase endpoint

### Authentication errors

Check that:
1. Your bearer token is valid and not expired
2. The token is correctly formatted in the Authorization header
3. The token has the necessary permissions for video generation

## License

MIT
