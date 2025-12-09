#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.VIDEO_API_BASE_URL || "http://localhost:3000";
const BEARER_TOKEN = process.env.VIDEO_API_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  console.error("Error: VIDEO_API_BEARER_TOKEN environment variable is required");
  process.exit(1);
}

interface ImageObject {
  imageBytes?: string;  // Base64 encoded image
  gcsUri?: string;      // GCS URI for the image
  mimeType?: string;    // MIME type of the image
}

interface VideoObject {
  videoBytes?: string;  // Base64 encoded video
  gcsUri?: string;      // GCS URI for the video
  mimeType?: string;    // MIME type of the video
}

interface ReferenceImage {
  image: ImageObject;
  referenceType?: string;  // Style or content reference type
}

interface VideoGenerationConfig {
  aspectRatio?: string;
  negativePrompt?: string;
  resolution?: string;          // "720p" or "1080p"
  durationSeconds?: number;     // 4, 5, 6, or 8
  personGeneration?: string;    // "allow_all", "allow_adult", "dont_allow"
  image?: ImageObject;          // Initial image to animate
  lastFrame?: ImageObject;      // Final image for interpolation
  referenceImages?: ReferenceImage[];  // Up to 3 images for style/content (Veo 3.1 only)
  video?: VideoObject;          // Video for extension
}

interface VideoGenerationRequest {
  prompt: string;
  model?: string;
  config?: VideoGenerationConfig;
}

interface VideoGenerationResponse {
  success: boolean;
  data?: {
    videoUrl: string;
    storagePath: string;
    prompt: string;
    operation: {
      name: string;
      done: boolean;
      metadata: Record<string, any>;
    };
  };
  error?: string;
  message?: string;
}

async function generateVideo(
  prompt: string,
  model?: string,
  config?: VideoGenerationConfig
): Promise<VideoGenerationResponse> {
  const requestBody: VideoGenerationRequest = {
    prompt,
  };

  if (model) {
    requestBody.model = model;
  }

  if (config) {
    requestBody.config = config;
  }

  const response = await fetch(`${API_BASE_URL}/ai-service/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BEARER_TOKEN}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return await response.json();
}

const server = new Server(
  {
    name: "genai-video-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: "generate_video",
      description:
        "Generate a video using AI based on a text prompt. Supports text-to-video, image-to-video (with image parameter), video interpolation (with image and lastFrame), video extension (with video parameter), and reference images for style/content guidance (Veo 3.1 only). Video generation is asynchronous and may take several minutes.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "The text description of the video you want to generate",
          },
          model: {
            type: "string",
            description:
              'The AI model to use for video generation (default: "veo-3.1-generate-preview")',
          },
          aspectRatio: {
            type: "string",
            description:
              'The aspect ratio of the generated video. Options: "16:9" (default, 720p & 1080p), "9:16" (720p & 1080p)',
          },
          negativePrompt: {
            type: "string",
            description: "Things you want to avoid in the generated video",
          },
          resolution: {
            type: "string",
            description:
              'The resolution of the generated video. Options: "720p" (default), "1080p" (only supports 8s duration). Use "720p" for video extension.',
          },
          durationSeconds: {
            type: "number",
            description:
              'Length of the generated video in seconds. Options: 4, 5, 6, or 8. Must be 8 when using extension/interpolation or referenceImages (16:9 only).',
          },
          personGeneration: {
            type: "string",
            description:
              'Controls the generation of people. Text-to-video & Extension: "allow_all" only. Image-to-video, Interpolation & Reference images: "allow_adult" only. Options: "allow_all", "allow_adult", "dont_allow".',
          },
          image: {
            type: "object",
            description:
              'An initial image to animate (Image-to-video). Provide either imageBytes (base64) or gcsUri.',
            properties: {
              imageBytes: { type: "string", description: "Base64 encoded image data" },
              gcsUri: { type: "string", description: "GCS URI for the image (gs://...)" },
              mimeType: { type: "string", description: "MIME type of the image (e.g., image/png)" },
            },
          },
          lastFrame: {
            type: "object",
            description:
              'The final image for an interpolation video. Must be used with the image parameter.',
            properties: {
              imageBytes: { type: "string", description: "Base64 encoded image data" },
              gcsUri: { type: "string", description: "GCS URI for the image (gs://...)" },
              mimeType: { type: "string", description: "MIME type of the image (e.g., image/png)" },
            },
          },
          referenceImages: {
            type: "array",
            description:
              'Up to three images to be used as style and content references (Veo 3.1 only).',
            items: {
              type: "object",
              properties: {
                image: {
                  type: "object",
                  properties: {
                    imageBytes: { type: "string", description: "Base64 encoded image data" },
                    gcsUri: { type: "string", description: "GCS URI for the image (gs://...)" },
                    mimeType: { type: "string", description: "MIME type of the image" },
                  },
                },
                referenceType: { type: "string", description: "Reference type (style or content)" },
              },
            },
          },
          video: {
            type: "object",
            description:
              'Video to be used for video extension. Provide either videoBytes (base64) or gcsUri.',
            properties: {
              videoBytes: { type: "string", description: "Base64 encoded video data" },
              gcsUri: { type: "string", description: "GCS URI for the video (gs://...)" },
              mimeType: { type: "string", description: "MIME type of the video (e.g., video/mp4)" },
            },
          },
        },
        required: ["prompt"],
      },
    },
  ];

  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "generate_video") {
    const args = request.params.arguments as {
      prompt: string;
      model?: string;
      aspectRatio?: string;
      negativePrompt?: string;
      resolution?: string;
      durationSeconds?: number;
      personGeneration?: string;
      image?: ImageObject;
      lastFrame?: ImageObject;
      referenceImages?: ReferenceImage[];
      video?: VideoObject;
    };

    if (!args.prompt) {
      throw new Error("prompt is required");
    }

    try {
      const config: VideoGenerationConfig = {};

      if (args.aspectRatio) {
        config.aspectRatio = args.aspectRatio;
      }

      if (args.negativePrompt) {
        config.negativePrompt = args.negativePrompt;
      }

      if (args.resolution) {
        config.resolution = args.resolution;
      }

      if (args.durationSeconds) {
        config.durationSeconds = args.durationSeconds;
      }

      if (args.personGeneration) {
        config.personGeneration = args.personGeneration;
      }

      if (args.image) {
        config.image = args.image;
      }

      if (args.lastFrame) {
        config.lastFrame = args.lastFrame;
      }

      if (args.referenceImages) {
        config.referenceImages = args.referenceImages;
      }

      if (args.video) {
        config.video = args.video;
      }

      const result = await generateVideo(
        args.prompt,
        args.model,
        Object.keys(config).length > 0 ? config : undefined
      );

      if (result.success && result.data) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  videoUrl: result.data.videoUrl,
                  storagePath: result.data.storagePath,
                  prompt: result.data.prompt,
                  operation: result.data.operation,
                },
                null,
                2
              ),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: result.error || "Unknown error occurred",
                  message: result.message,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: "Failed to generate video",
                message: error instanceof Error ? error.message : String(error),
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GenAI Video MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
