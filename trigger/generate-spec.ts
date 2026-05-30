import { task, metadata } from "@trigger.dev/sdk";
import { getLiveblocks } from "@/lib/liveblocks";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { put } from "@vercel/blob";

const generateSpecInputSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(
    z.object({
      sender: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      timestamp: z.number(),
    })
  ),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      position: z.object({ x: z.number(), y: z.number() }).optional(),
      style: z.record(z.string(), z.any()).optional(),
      data: z.object({
        label: z.string().optional(),
        shape: z.string().optional(),
        color: z.string().optional(),
        textColor: z.string().optional(),
      }).optional(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      source: z.string(),
      target: z.string(),
      data: z.object({
        label: z.string().optional(),
      }).optional(),
    })
  ),
});

export const generateSpec = task({
  id: "generate-spec",
  run: async (payload: unknown) => {
    console.log("Spec generation task triggered");

    const liveblocks = getLiveblocks();

    // Note: Since we need roomId for updateStatus, we'll extract it directly first if possible
    const rawPayload = payload as any;
    const roomId = rawPayload?.roomId;

    const updateStatus = async (statusText: string) => {
      metadata.set("status", statusText);
      if (!roomId) return;
      try {
        await liveblocks.createFeedMessage({
          roomId,
          feedId: "ai-status-feed",
          data: { text: statusText },
        });
      } catch (err) {
        console.warn("Failed to post to ai-status-feed:", err);
      }
    };

    // 1. Validate payload with Zod safely
    const validationResult = generateSpecInputSchema.safeParse(payload);
    
    if (!validationResult.success) {
      console.error("Payload validation failed:", validationResult.error);
      const errorMsg = `Invalid payload: ${validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      await updateStatus(`Failed: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const { projectId, chatHistory, nodes, edges } = validationResult.data;

    await updateStatus("Analyzing system architecture...");

    try {
      // 2. Fetch Gemini API Key
      const apiKey =
        process.env.GOOGLE_AI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("Missing Google AI API Key in environment variables.");
      }

      const google = createGoogleGenerativeAI({ apiKey });
      await updateStatus("Generating technical specification...");

      // 3. Construct prompt
      const systemInstruction = `You are a highly experienced systems architect.
Your task is to generate a comprehensive, professional Markdown technical specification document based on a system diagram's components (nodes and edges) and the conversation history of the design decisions.

Guidelines:
- Provide high-quality, professional, and detailed documentation.
- The output MUST be a valid Markdown document. Do not wrap the response in markdown code blocks like \`\`\`markdown ... \`\`\`: write the raw markdown text directly.
- The document must have clear, structured sections.
- Make sure to interpret the connections between components (edges) as communication pathways or dependencies.
- Incorporate design decisions, requirements, or issues raised in the chat history.
`;

      const prompt = `
Generate a technical specification for the project ID "${projectId}".

### Diagram Components:
#### Nodes (Services, Databases, Endpoints, etc.):
${JSON.stringify(
  nodes.map((n) => ({
    id: n.id,
    label: n.data?.label || n.id,
    shape: n.data?.shape || "rectangle",
    color: n.data?.color || "default",
  })),
  null,
  2
)}

#### Edges (Connections / Communication Pathways):
${JSON.stringify(
  edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.data?.label || "connects to",
  })),
  null,
  2
)}

### Conversation Design Decisions (Chat History):
${chatHistory
  .map(
    (msg) =>
      `[${new Date(msg.timestamp).toISOString()}] ${msg.sender} (${msg.role}): ${msg.content}`
  )
  .join("\n")}

Please write the complete technical specification in detailed Markdown.
`;

      let response;
      try {
        console.log("Calling gemini-2.5-flash for spec generation...");
        response = await generateText({
          model: google("gemini-2.5-flash"),
          system: systemInstruction,
          prompt,
          maxRetries: 5,
        });
      } catch (err: any) {
        const isUnavailable =
          err.statusCode === 503 ||
          err.statusCode === 429 ||
          err.message?.includes("503") ||
          err.message?.includes("429") ||
          /high demand|limit|service unavailable|overloaded/i.test(err.message || "");

        if (isUnavailable) {
          console.warn("gemini-2.5-flash is overloaded. Falling back to gemini-2.0-flash...", err);
          await updateStatus("Retrying with backup model...");
          response = await generateText({
            model: google("gemini-2.0-flash"),
            system: systemInstruction,
            prompt,
            maxRetries: 5,
          });
        } else {
          throw err;
        }
      }

      const markdownOutput = response.text;
      console.log("Spec generation completed successfully.");

      await updateStatus("Saving specification...");

      // 4. Create metadata record in Prisma
      const { prisma } = await import("@/lib/prisma");
      const specRecord = await prisma.projectSpec.create({
        data: {
          projectId,
          filePath: "", // Will update after Vercel Blob upload
        },
      });

      // 5. Upload specification content to Vercel Blob
      const pathname = `specs/${projectId}/${specRecord.id}.md`;
      const blob = await put(pathname, markdownOutput, {
        access: "private",
        contentType: "text/markdown",
        allowOverwrite: true,
      });

      // 6. Update database record with actual Blob URL
      await prisma.projectSpec.update({
        where: { id: specRecord.id },
        data: {
          filePath: blob.url,
        },
      });

      await updateStatus("Complete");

      return markdownOutput;
    } catch (err: any) {
      console.error("Spec generation task failed:", err);
      await updateStatus(`Failed: ${err.message}`);
      throw err;
    }
  },
});
