import {
  LiveMap,
  LiveObject,
  createGoogleGenerativeAI,
  external_exports,
  generateText,
  getLiveblocks,
  isLoopFinished,
  stepCountIs,
  tool
} from "../../../../chunk-K63NHLHW.mjs";
import "../../../../chunk-ZAPSEY2N.mjs";
import {
  metadata,
  task
} from "../../../../chunk-F2EMMKZN.mjs";
import "../../../../chunk-5YGEVNCX.mjs";
import {
  __name,
  init_esm
} from "../../../../chunk-TQ3WNEB5.mjs";

// trigger/design-agent.ts
init_esm();

// types/canvas.ts
init_esm();
var NODE_COLORS = [
  { fill: "#1F1F1F", text: "#EDEDED", name: "Neutral" },
  { fill: "#10233D", text: "#52A8FF", name: "Blue" },
  { fill: "#2E1938", text: "#BF7AF0", name: "Purple" },
  { fill: "#331B00", text: "#FF990A", name: "Orange" },
  { fill: "#3C1618", text: "#FF6166", name: "Red" },
  { fill: "#3A1726", text: "#F75F8F", name: "Pink" },
  { fill: "#0F2E18", text: "#62C073", name: "Green" },
  { fill: "#062822", text: "#0AC7B4", name: "Teal" }
];

// trigger/design-agent.ts
var designAgent = task({
  id: "design-agent",
  run: /* @__PURE__ */ __name(async (payload) => {
    const { prompt, roomId } = payload;
    console.log(`Design agent triggered for room: ${roomId.slice(0, 8)}... Prompt length: ${prompt.length}`);
    let liveblocks;
    try {
      liveblocks = getLiveblocks();
    } catch (err) {
      console.warn("Failed to initialize Liveblocks client. Proceeding without Liveblocks.", err);
    }
    const updateStatus = /* @__PURE__ */ __name(async (statusText) => {
      metadata.set("status", statusText);
      if (!liveblocks) return;
      try {
        await liveblocks.createFeedMessage({
          roomId,
          feedId: "ai-status-feed",
          data: { text: statusText }
        });
      } catch (err) {
        console.warn("Failed to post to ai-status-feed:", err);
      }
    }, "updateStatus");
    if (liveblocks) {
      try {
        await liveblocks.setPresence(roomId, {
          userId: "ghost-ai",
          data: {
            cursor: { x: 200, y: 200 },
            isThinking: true
          },
          userInfo: {
            id: "ghost-ai",
            name: "Ghost AI",
            avatar: "https://avatar.vercel.sh/ghost-ai",
            cursorColor: "#6457f9"
          },
          ttl: 180
        });
      } catch (err) {
        console.warn("Failed to set initial AI presence:", err);
      }
    }
    await updateStatus("Analyzing prompt...");
    try {
      let currentNodes = [];
      let currentEdges = [];
      let initialVersion = null;
      if (liveblocks) {
        try {
          const storage = await liveblocks.getStorageDocument(roomId, "json");
          const canvasState = storage?.canvas_state;
          if (canvasState) {
            initialVersion = canvasState.version || null;
            const rawNodes = canvasState.nodes ?? {};
            const rawEdges = canvasState.edges ?? {};
            currentNodes = Array.isArray(rawNodes) ? rawNodes : Object.values(rawNodes);
            currentEdges = Array.isArray(rawEdges) ? rawEdges : Object.values(rawEdges);
          }
        } catch (err) {
          console.warn("Failed to fetch storage document (may be empty room):", err);
        }
      }
      const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing Google AI API Key in environment variables.");
      }
      const google = createGoogleGenerativeAI({ apiKey });
      await updateStatus("Generating system layout...");
      const colorsGuideline = NODE_COLORS.map((c) => `- ${c.name}: fill "${c.fill}", text "${c.text}"`).join("\n");
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
      const updatePointer = /* @__PURE__ */ __name(async (x, y) => {
        if (!liveblocks) return;
        try {
          await liveblocks.setPresence(roomId, {
            userId: "ghost-ai",
            data: {
              cursor: { x, y },
              isThinking: true
            },
            userInfo: {
              id: "ghost-ai",
              name: "Ghost AI",
              avatar: "https://avatar.vercel.sh/ghost-ai",
              cursorColor: "#6457f9"
            },
            ttl: 180
          });
        } catch (err) {
        }
      }, "updatePointer");
      const agentTools = {
        addNode: tool({
          description: "Add a new node to the canvas.",
          inputSchema: external_exports.object({
            id: external_exports.string().describe("Unique node ID, e.g., 'node-1', 'node-2'"),
            shape: external_exports.enum(["rectangle", "circle", "diamond", "pill", "cylinder", "hexagon"]),
            label: external_exports.string().describe("Label/title of the node"),
            color: external_exports.string().describe("Hex fill color of the node (must match allowed fills)"),
            textColor: external_exports.string().describe("Hex text color of the node (must match allowed text colors)"),
            x: external_exports.number().describe("X coordinate for the node position"),
            y: external_exports.number().describe("Y coordinate for the node position"),
            width: external_exports.number().describe("Width of the node (must match allowed shapes size)"),
            height: external_exports.number().describe("Height of the node (must match allowed shapes size)")
          }),
          execute: /* @__PURE__ */ __name(async (args) => {
            workingNodes.push({
              id: args.id,
              type: "canvasNode",
              position: { x: args.x, y: args.y },
              style: { width: args.width, height: args.height },
              data: {
                label: args.label,
                shape: args.shape,
                color: args.color,
                textColor: args.textColor
              }
            });
            await updatePointer(args.x, args.y);
            return `Node ${args.id} added at (${args.x}, ${args.y}).`;
          }, "execute")
        }),
        moveNode: tool({
          description: "Move an existing node to new coordinates.",
          inputSchema: external_exports.object({
            id: external_exports.string().describe("ID of the node to move"),
            x: external_exports.number().describe("New X coordinate"),
            y: external_exports.number().describe("New Y coordinate")
          }),
          execute: /* @__PURE__ */ __name(async (args) => {
            const node = workingNodes.find((n) => n.id === args.id);
            if (node) {
              node.position = { x: args.x, y: args.y };
              await updatePointer(args.x, args.y);
              return `Node ${args.id} moved to (${args.x}, ${args.y}).`;
            }
            return `Error: Node ${args.id} not found.`;
          }, "execute")
        }),
        resizeNode: tool({
          description: "Resize an existing node's dimensions.",
          inputSchema: external_exports.object({
            id: external_exports.string().describe("ID of the node to resize"),
            width: external_exports.number().describe("New width"),
            height: external_exports.number().describe("New height")
          }),
          execute: /* @__PURE__ */ __name(async (args) => {
            const node = workingNodes.find((n) => n.id === args.id);
            if (node) {
              node.style = { width: args.width, height: args.height };
              if (node.position) {
                await updatePointer(node.position.x, node.position.y);
              }
              return `Node ${args.id} resized to ${args.width}x${args.height}.`;
            }
            return `Error: Node ${args.id} not found.`;
          }, "execute")
        }),
        updateNodeData: tool({
          description: "Update the data of an existing node (label, color, textColor).",
          inputSchema: external_exports.object({
            id: external_exports.string().describe("ID of the node to update"),
            label: external_exports.string().optional().describe("New label for the node"),
            color: external_exports.string().optional().describe("New hex fill color"),
            textColor: external_exports.string().optional().describe("New hex text color")
          }),
          execute: /* @__PURE__ */ __name(async (args) => {
            const node = workingNodes.find((n) => n.id === args.id);
            if (node) {
              if (args.label !== void 0) node.data.label = args.label;
              if (args.color !== void 0) node.data.color = args.color;
              if (args.textColor !== void 0) node.data.textColor = args.textColor;
              if (node.position) {
                await updatePointer(node.position.x, node.position.y);
              }
              return `Node ${args.id} updated successfully.`;
            }
            return `Error: Node ${args.id} not found.`;
          }, "execute")
        }),
        deleteNode: tool({
          description: "Delete a node from the canvas and all its connected edges.",
          inputSchema: external_exports.object({
            id: external_exports.string().describe("ID of the node to delete")
          }),
          execute: /* @__PURE__ */ __name(async (args) => {
            const nodeIndex = workingNodes.findIndex((n) => n.id === args.id);
            if (nodeIndex !== -1) {
              const node = workingNodes[nodeIndex];
              workingNodes.splice(nodeIndex, 1);
              workingEdges = workingEdges.filter(
                (e) => e.source !== args.id && e.target !== args.id
              );
              if (node.position) {
                await updatePointer(node.position.x, node.position.y);
              }
              return `Node ${args.id} and its connected edges deleted.`;
            }
            return `Error: Node ${args.id} not found.`;
          }, "execute")
        }),
        addEdge: tool({
          description: "Add a connected edge between two nodes.",
          inputSchema: external_exports.object({
            id: external_exports.string().describe("Unique edge ID, e.g., 'edge-1'"),
            source: external_exports.string().describe("Source node ID"),
            target: external_exports.string().describe("Target node ID"),
            label: external_exports.string().optional().describe("Optional edge path label")
          }),
          execute: /* @__PURE__ */ __name(async (args) => {
            workingEdges.push({
              id: args.id,
              type: "canvasEdge",
              source: args.source,
              target: args.target,
              data: {
                label: args.label || ""
              },
              markerEnd: {
                type: "arrowclosed",
                color: "var(--text-secondary)"
              }
            });
            const targetNode = workingNodes.find((n) => n.id === args.target);
            if (targetNode && targetNode.position) {
              await updatePointer(targetNode.position.x, targetNode.position.y);
            }
            return `Edge ${args.id} added from ${args.source} to ${args.target}.`;
          }, "execute")
        }),
        deleteEdge: tool({
          description: "Delete an edge from the canvas.",
          inputSchema: external_exports.object({
            id: external_exports.string().describe("ID of the edge to delete")
          }),
          execute: /* @__PURE__ */ __name(async (args) => {
            const edgeIndex = workingEdges.findIndex((e) => e.id === args.id);
            if (edgeIndex !== -1) {
              workingEdges.splice(edgeIndex, 1);
              return `Edge ${args.id} deleted.`;
            }
            return `Error: Edge ${args.id} not found.`;
          }, "execute")
        })
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
          tools: agentTools
        });
      } catch (err) {
        const isUnavailable = err.statusCode === 503 || err.statusCode === 429 || err.message?.includes("503") || err.message?.includes("429") || /high demand|limit|service unavailable|overloaded/i.test(err.message || "");
        if (isUnavailable) {
          console.warn("gemini-2.5-flash is experiencing high demand or rate limit. Falling back to gemini-2.0-flash...", err);
          await updateStatus("Retrying with backup model...");
          response = await generateText({
            model: google("gemini-2.0-flash"),
            system: systemInstruction,
            prompt: `User Prompt: "${prompt}"`,
            stopWhen: [isLoopFinished(), stepCountIs(25)],
            maxRetries: 5,
            tools: agentTools
          });
        } else {
          throw err;
        }
      }
      console.log("Gemini response tool calling completed.");
      await updateStatus("Drawing nodes and edges...");
      if (liveblocks) {
        await liveblocks.mutateStorage(roomId, ({ root }) => {
          let canvasState = root.get("canvas_state");
          if (!canvasState) {
            canvasState = new LiveObject({
              nodes: new LiveMap(),
              edges: new LiveMap(),
              version: "0"
            });
            root.set("canvas_state", canvasState);
          }
          const currentVersion = canvasState.get("version") || null;
          if (initialVersion !== null && currentVersion !== initialVersion) {
            console.warn("Stale canvas state version. Aborting mutate.");
            return;
          }
          canvasState.set("version", Date.now().toString());
          const liveNodes = canvasState.get("nodes");
          const liveEdges = canvasState.get("edges");
          const workingNodeIds = new Set(workingNodes.map((n) => n.id));
          for (const key of Array.from(liveNodes.keys())) {
            if (!workingNodeIds.has(key)) liveNodes.delete(key);
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
                  textColor: n.data.textColor
                })
              })
            );
          }
          const workingEdgeIds = new Set(workingEdges.map((e) => e.id));
          for (const key of Array.from(liveEdges.keys())) {
            if (!workingEdgeIds.has(key)) liveEdges.delete(key);
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
                  label: e.data?.label || ""
                }),
                markerEnd: {
                  type: "arrowclosed",
                  color: "var(--text-secondary)"
                }
              })
            );
          }
        });
      }
      if (liveblocks) {
        try {
          await liveblocks.setPresence(roomId, {
            userId: "ghost-ai",
            data: {
              cursor: null,
              isThinking: false
            },
            userInfo: {
              id: "ghost-ai",
              name: "Ghost AI",
              avatar: "https://avatar.vercel.sh/ghost-ai",
              cursorColor: "#6457f9"
            },
            ttl: 10
            // expire quickly since we are done
          });
        } catch (err) {
          console.warn("Failed to set final AI presence cursor:", err);
        }
      }
      await updateStatus("Complete");
      return { success: true };
    } catch (err) {
      console.error("Design agent execution failed:", err);
      await updateStatus(`Failed: ${err.message}`);
      if (liveblocks) {
        try {
          await liveblocks.setPresence(roomId, {
            userId: "ghost-ai",
            data: {
              cursor: null,
              isThinking: false
            },
            userInfo: {
              id: "ghost-ai",
              name: "Ghost AI",
              avatar: "https://avatar.vercel.sh/ghost-ai",
              cursorColor: "#6457f9"
            },
            ttl: 10
          });
        } catch (presenceErr) {
          console.warn("Failed to clear AI presence on error:", presenceErr);
        }
      }
      return { success: false, error: err.message };
    }
  }, "run")
});
export {
  designAgent
};
//# sourceMappingURL=design-agent.mjs.map
