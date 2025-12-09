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

interface VideoGenerationConfig {
  aspectRatio?: string;
  negativePrompt?: string;
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
        "Generate a video using AI based on a text prompt. The API supports optional model selection and configuration for aspect ratio and negative prompts. Video generation is asynchronous and may take several minutes.",
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
              'The aspect ratio of the generated video (e.g., "16:9", "9:16", "1:1")',
          },
          negativePrompt: {
            type: "string",
            description: "Things you want to avoid in the generated video",
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
