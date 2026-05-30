import { task, metadata } from "@trigger.dev/sdk";
import { getLiveblocks } from "@/lib/liveblocks";
import { LiveObject, LiveMap } from "@liveblocks/node";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, tool, isLoopFinished, stepCountIs } from "ai";
import { z } from "zod";
import { NODE_COLORS } from "@/types/canvas";

export const designAgent = task({
  id: "design-agent",
  run: async (payload: { prompt: string; roomId: string; projectId: string; userId: string }) => {
    console.log("Design agent triggered with payload:", payload);
    const { prompt, roomId } = payload;
    const liveblocks = getLiveblocks();

    const updateStatus = async (statusText: string) => {
      metadata.set("status", statusText);
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

    // 1. Initialize AI presence (cursor at center-ish, isThinking = true)
    try {
      await liveblocks.setPresence(roomId, {
        userId: "ghost-ai",
        data: {
          cursor: { x: 200, y: 200 },
          isThinking: true,
        },
        userInfo: {
          id: "ghost-ai",
          name: "Ghost AI",
          avatar: "https://avatar.vercel.sh/ghost-ai",
          cursorColor: "#6457f9",
        },
        ttl: 180,
      });
    } catch (err) {
      console.warn("Failed to set initial AI presence:", err);
    }

    await updateStatus("Analyzing prompt...");

    try {
      // 2. Fetch current canvas state to provide context
      let currentNodes: any[] = [];
      let currentEdges: any[] = [];
      try {
        const storage = await liveblocks.getStorageDocument(roomId, "json");
        const canvasState = (storage as any)?.canvas_state;
        if (canvasState) {
          const rawNodes = canvasState.nodes ?? {};
          const rawEdges = canvasState.edges ?? {};
          currentNodes = Array.isArray(rawNodes) ? rawNodes : Object.values(rawNodes);
          currentEdges = Array.isArray(rawEdges) ? rawEdges : Object.values(rawEdges);
        }
      } catch (err) {
        console.warn("Failed to fetch storage document (may be empty room):", err);
      }

      // 3. Initialize Gemini client
      const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing Google AI API Key in environment variables.");
      }

      const google = createGoogleGenerativeAI({ apiKey });
      await updateStatus("Generating system layout...");

      // 4. Prompt Gemini for structured layout
      const colorsGuideline = NODE_COLORS.map(c => `- ${c.name}: fill "${c.fill}", text "${c.text}"`).join("\n");
      const systemInstruction = `You are a skilled software architect and system design AI.
You generate or update canvas diagrams based on user prompts.

## Allowed Shapes & Spacing Rules:
- "rectangle": default component, service, user (width: 180, height: 80)
- "circle": event, endpoint, trigger (width: 120, height: 120)
- "diamond": decision, gateway, branching (width: 120, height: 120)
- "pill": process, background worker, job (width: 160, height: 70)
- "cylinder": database, cache, message queue, storage (width: 140, height: 160)
- "hexagon": external system, boundary, third-party API (width: 160, height: 140)

## Spacing and Layout:
- NEVER overlap nodes.
- Horizontal distance between center of connected nodes should be 280-350px.
- Vertical distance between center of connected nodes should be 220-300px.
- Position the nodes starting from x: 100, y: 150 and flow logically (e.g. Client -> Load Balancer -> Web App -> Database).
- Flow direction: generally left-to-right (increasing X) or top-to-bottom (increasing Y).

## Node Colors:
Choose from these exact color pairs (fill & textColor hex values):
${colorsGuideline}

## Existing Canvas Context:
- Current Nodes: ${JSON.stringify(currentNodes)}
- Current Edges: ${JSON.stringify(currentEdges)}

Modify, add, delete, or rearrange nodes and edges to satisfy the user's prompt.`;

      let workingNodes = [...currentNodes];
      let workingEdges = [...currentEdges];

      // Helper function to update pointer presence dynamically during tool execution
      const updatePointer = async (x: number, y: number) => {
        try {
          await liveblocks.setPresence(roomId, {
            userId: "ghost-ai",
            data: {
              cursor: { x, y },
              isThinking: true,
            },
            userInfo: {
              id: "ghost-ai",
              name: "Ghost AI",
              avatar: "https://avatar.vercel.sh/ghost-ai",
              cursorColor: "#6457f9",
            },
            ttl: 180,
          });
        } catch (err) {
          // ignore
        }
      };

      const agentTools = {
        addNode: tool({
          description: "Add a new node to the canvas.",
          inputSchema: z.object({
            id: z.string().describe("Unique node ID, e.g., 'node-1', 'node-2'"),
            shape: z.enum(["rectangle", "circle", "diamond", "pill", "cylinder", "hexagon"]),
            label: z.string().describe("Label/title of the node"),
            color: z.string().describe("Hex fill color of the node (must match allowed fills)"),
            textColor: z.string().describe("Hex text color of the node (must match allowed text colors)"),
            x: z.number().describe("X coordinate for the node position"),
            y: z.number().describe("Y coordinate for the node position"),
            width: z.number().describe("Width of the node (must match allowed shapes size)"),
            height: z.number().describe("Height of the node (must match allowed shapes size)"),
          }),
          execute: async (args) => {
            workingNodes.push({
              id: args.id,
              type: "canvasNode",
              position: { x: args.x, y: args.y },
              style: { width: args.width, height: args.height },
              data: {
                label: args.label,
                shape: args.shape,
                color: args.color,
                textColor: args.textColor,
              },
            });
            await updatePointer(args.x, args.y);
            return `Node ${args.id} added at (${args.x}, ${args.y}).`;
          },
        }),
        moveNode: tool({
          description: "Move an existing node to new coordinates.",
          inputSchema: z.object({
            id: z.string().describe("ID of the node to move"),
            x: z.number().describe("New X coordinate"),
            y: z.number().describe("New Y coordinate"),
          }),
          execute: async (args) => {
            const node = workingNodes.find((n) => n.id === args.id);
            if (node) {
              node.position = { x: args.x, y: args.y };
              await updatePointer(args.x, args.y);
              return `Node ${args.id} moved to (${args.x}, ${args.y}).`;
            }
            return `Error: Node ${args.id} not found.`;
          },
        }),
        resizeNode: tool({
          description: "Resize an existing node's dimensions.",
          inputSchema: z.object({
            id: z.string().describe("ID of the node to resize"),
            width: z.number().describe("New width"),
            height: z.number().describe("New height"),
          }),
          execute: async (args) => {
            const node = workingNodes.find((n) => n.id === args.id);
            if (node) {
              node.style = { width: args.width, height: args.height };
              if (node.position) {
                await updatePointer(node.position.x, node.position.y);
              }
              return `Node ${args.id} resized to ${args.width}x${args.height}.`;
            }
            return `Error: Node ${args.id} not found.`;
          },
        }),
        updateNodeData: tool({
          description: "Update the data of an existing node (label, color, textColor).",
          inputSchema: z.object({
            id: z.string().describe("ID of the node to update"),
            label: z.string().optional().describe("New label for the node"),
            color: z.string().optional().describe("New hex fill color"),
            textColor: z.string().optional().describe("New hex text color"),
          }),
          execute: async (args) => {
            const node = workingNodes.find((n) => n.id === args.id);
            if (node) {
              if (args.label !== undefined) node.data.label = args.label;
              if (args.color !== undefined) node.data.color = args.color;
              if (args.textColor !== undefined) node.data.textColor = args.textColor;
              if (node.position) {
                await updatePointer(node.position.x, node.position.y);
              }
              return `Node ${args.id} updated successfully.`;
            }
            return `Error: Node ${args.id} not found.`;
          },
        }),
        deleteNode: tool({
          description: "Delete a node from the canvas and all its connected edges.",
          inputSchema: z.object({
            id: z.string().describe("ID of the node to delete"),
          }),
          execute: async (args) => {
            const nodeIndex = workingNodes.findIndex((n) => n.id === args.id);
            if (nodeIndex !== -1) {
              const node = workingNodes[nodeIndex];
              workingNodes.splice(nodeIndex, 1);
              // Clean up connected edges
              workingEdges = workingEdges.filter(
                (e) => e.source !== args.id && e.target !== args.id
              );
              if (node.position) {
                await updatePointer(node.position.x, node.position.y);
              }
              return `Node ${args.id} and its connected edges deleted.`;
            }
            return `Error: Node ${args.id} not found.`;
          },
        }),
        addEdge: tool({
          description: "Add a connected edge between two nodes.",
          inputSchema: z.object({
            id: z.string().describe("Unique edge ID, e.g., 'edge-1'"),
            source: z.string().describe("Source node ID"),
            target: z.string().describe("Target node ID"),
            label: z.string().optional().describe("Optional edge path label"),
          }),
          execute: async (args) => {
            workingEdges.push({
              id: args.id,
              type: "canvasEdge",
              source: args.source,
              target: args.target,
              data: {
                label: args.label || "",
              },
              markerEnd: {
                type: "arrowclosed",
                color: "var(--text-secondary)",
              },
            });
            // Move cursor near the target node if it exists
            const targetNode = workingNodes.find((n) => n.id === args.target);
            if (targetNode && targetNode.position) {
              await updatePointer(targetNode.position.x, targetNode.position.y);
            }
            return `Edge ${args.id} added from ${args.source} to ${args.target}.`;
          },
        }),
        deleteEdge: tool({
          description: "Delete an edge from the canvas.",
          inputSchema: z.object({
            id: z.string().describe("ID of the edge to delete"),
          }),
          execute: async (args) => {
            const edgeIndex = workingEdges.findIndex((e) => e.id === args.id);
            if (edgeIndex !== -1) {
              workingEdges.splice(edgeIndex, 1);
              return `Edge ${args.id} deleted.`;
            }
            return `Error: Edge ${args.id} not found.`;
          },
        }),
      };

      let response;
      try {
        console.log("Attempting layout generation with gemini-2.5-flash...");
        response = await generateText({
          model: google("gemini-2.5-flash"),
          system: systemInstruction,
          prompt: `User Prompt: "${prompt}"`,
          stopWhen: [isLoopFinished(), stepCountIs(25)],
          maxRetries: 5,
          tools: agentTools,
        });
      } catch (err: any) {
        const isUnavailable =
          err.statusCode === 503 ||
          err.statusCode === 429 ||
          err.message?.includes("503") ||
          err.message?.includes("429") ||
          /high demand|limit|service unavailable|overloaded/i.test(err.message || "");

        if (isUnavailable) {
          console.warn("gemini-2.5-flash is experiencing high demand or rate limit. Falling back to gemini-2.0-flash...", err);
          await updateStatus("Retrying with backup model...");
          response = await generateText({
            model: google("gemini-2.0-flash"),
            system: systemInstruction,
            prompt: `User Prompt: "${prompt}"`,
            stopWhen: [isLoopFinished(), stepCountIs(25)],
            maxRetries: 5,
            tools: agentTools,
          });
        } else {
          throw err;
        }
      }

      console.log("Gemini response tool calling completed.");

      await updateStatus("Drawing nodes and edges...");

      // 5. Apply the nodes and edges to Liveblocks Storage
      await liveblocks.mutateStorage(roomId, ({ root }) => {
        let canvasState = (root as any).get("canvas_state");
        if (!canvasState) {
          canvasState = new LiveObject({
            nodes: new LiveMap(),
            edges: new LiveMap(),
          });
          (root as any).set("canvas_state", canvasState);
        }

        const liveNodes = canvasState.get("nodes") as LiveMap<string, any>;
        const liveEdges = canvasState.get("edges") as LiveMap<string, any>;

        // Clear LiveMap nodes
        for (const key of Array.from(liveNodes.keys())) {
          liveNodes.delete(key);
        }
        for (const n of workingNodes) {
          liveNodes.set(
            n.id,
            new LiveObject({
              id: n.id,
              type: "canvasNode",
              position: { x: n.position.x, y: n.position.y },
              style: new LiveObject({ width: n.style.width, height: n.style.height }),
              data: new LiveObject({
                label: n.data.label,
                shape: n.data.shape,
                color: n.data.color,
                textColor: n.data.textColor,
              }),
            })
          );
        }

        // Clear LiveMap edges
        for (const key of Array.from(liveEdges.keys())) {
          liveEdges.delete(key);
        }
        for (const e of workingEdges) {
          liveEdges.set(
            e.id,
            new LiveObject({
              id: e.id,
              type: "canvasEdge",
              source: e.source,
              target: e.target,
              data: new LiveObject({
                label: e.data?.label || "",
              }),
              markerEnd: {
                type: "arrowclosed",
                color: "var(--text-secondary)",
              },
            })
          );
        }
      });

      // Move cursor to center of drawn nodes as final presence step
      if (workingNodes.length > 0) {
        const sumX = workingNodes.reduce((acc, n) => acc + n.position.x, 0);
        const sumY = workingNodes.reduce((acc, n) => acc + n.position.y, 0);
        const avgX = sumX / workingNodes.length;
        const avgY = sumY / workingNodes.length;
        try {
          await liveblocks.setPresence(roomId, {
            userId: "ghost-ai",
            data: {
              cursor: { x: avgX, y: avgY },
              isThinking: false,
            },
            userInfo: {
              id: "ghost-ai",
              name: "Ghost AI",
              avatar: "https://avatar.vercel.sh/ghost-ai",
              cursorColor: "#6457f9",
            },
            ttl: 10, // expire quickly since we are done
          });
        } catch (err) {
          console.warn("Failed to set final AI presence cursor:", err);
        }
      }

      await updateStatus("Complete");
      return { success: true };
    } catch (err: any) {
      console.error("Design agent execution failed:", err);
      await updateStatus(`Failed: ${err.message}`);

      // Clear AI presence thinking on failure
      try {
        await liveblocks.setPresence(roomId, {
          userId: "ghost-ai",
          data: {
            cursor: { x: 200, y: 200 },
            isThinking: false,
          },
          userInfo: {
            id: "ghost-ai",
            name: "Ghost AI",
            avatar: "https://avatar.vercel.sh/ghost-ai",
            cursorColor: "#6457f9",
          },
          ttl: 10,
        });
      } catch (presenceErr) {
        console.warn("Failed to clear AI presence on error:", presenceErr);
      }

      return { success: false, error: err.message };
    }
  },
});
