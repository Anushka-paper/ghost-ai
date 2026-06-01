"use client";

import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { X, Bot, FileText, Send, Loader2, Download, Eye, Plus } from "lucide-react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useFeedMessages, useOthers, useCreateFeedMessage, useStorage } from "@liveblocks/react";
import { useUser } from "@clerk/nextjs";
import { validateAiStatusMessage, validateAiChatMessage } from "@/types/tasks";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { designAgent } from "@/trigger/design-agent";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface ProjectSpec {
  id: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface RunFailureDetails {
  output?: {
    error?: unknown;
  };
  error?: {
    message?: unknown;
  };
}

interface CanvasStorageSnapshot {
  canvas_state?: {
    nodes?: unknown;
    edges?: unknown;
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getRunErrorMessage(run: unknown) {
  const details = run as RunFailureDetails;
  const outputError = details.output?.error;
  const runError = details.error?.message;

  if (typeof outputError === "string") {
    return outputError;
  }

  if (typeof runError === "string") {
    return runError;
  }

  return "Unknown error";
}

function getCollectionItems(value: unknown): Record<string, unknown>[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
  }

  if (typeof value === "object" && "values" in value && typeof value.values === "function") {
    return Array.from(value.values()).filter(
      (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
    );
  }

  if (typeof value === "object") {
    return Object.values(value).filter(
      (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
    );
  }

  return [];
}

export function AiSidebar({ isOpen, onClose, projectId }: AiSidebarProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();
  const senderName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Guest";
 
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runToken, setRunToken] = useState<string | null>(null);
  const [runType, setRunType] = useState<"design" | "spec" | null>(null);

  // Specifications state
  const [specs, setSpecs] = useState<ProjectSpec[]>([]);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState<ProjectSpec | null>(null);
  const [specContent, setSpecContent] = useState<string>("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [specError, setSpecError] = useState<string | null>(null);
 
  const { run } = useRealtimeRun<typeof designAgent>(activeRunId || undefined, {
    accessToken: runToken || undefined,
    enabled: !!activeRunId && !!runToken,
  });
 
  const others = useOthers();

  // Read current canvas nodes and edges directly from Liveblocks Storage
  const storageSnapshot = useStorage((root) => root) as CanvasStorageSnapshot | null;
  const canvasState = storageSnapshot?.canvas_state;
  const nodes = useMemo(() => {
    return getCollectionItems(canvasState?.nodes);
  }, [canvasState]);

  const edges = useMemo(() => {
    return getCollectionItems(canvasState?.edges);
  }, [canvasState]);
  const { messages: feedMessages } = useFeedMessages("ai-status-feed");
  const { messages: chatFeedMessages } = useFeedMessages("ai-chat");
  const createFeedMessage = useCreateFeedMessage();
 
  const [sendError, setSendError] = useState<string | null>(null);
 
  // Determine if AI is thinking or generating
  const isAiThinking =
    !!activeRunId ||
    others.some((other) => {
      const presence = other.presence;
      return presence && (presence.isThinking || presence.thinking);
    });

  // Fetch the latest validated status message from the feed
  const latestFeedMessage = feedMessages && feedMessages.length > 0
    ? [...feedMessages].sort((a, b) => b.createdAt - a.createdAt)[0]
    : null;
 
  const validatedStatus = latestFeedMessage ? validateAiStatusMessage(latestFeedMessage.data) : null;
  const statusText = validatedStatus?.text || null;
 
  // Process and validate all room chat messages
  const validatedChatMessages = useMemo(() => {
    if (!chatFeedMessages) return [];
    
    const sorted = [...chatFeedMessages].sort((a, b) => a.createdAt - b.createdAt);
    
    return sorted
      .map((msg) => {
        const validated = validateAiChatMessage(msg.data);
        if (!validated) return null;
        return {
          id: msg.id,
          sender: validated.sender,
          role: validated.role,
          content: validated.content,
          timestamp: validated.timestamp,
        };
      })
      .filter((message): message is ChatMessage => message !== null);
  }, [chatFeedMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [validatedChatMessages.length, isAiThinking, statusText]);
 
  // Fetch specifications list
  const fetchSpecs = useCallback(async () => {
    setIsLoadingSpecs(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (res.ok) {
        const data = (await res.json()) as ProjectSpec[];
        setSpecs(data);
      }
    } catch (err) {
      console.error("Failed to fetch specs:", err);
    } finally {
      setIsLoadingSpecs(false);
    }
  }, [projectId]);

  // Load specs list on mount
  useEffect(() => {
    void Promise.resolve().then(fetchSpecs);
  }, [fetchSpecs]);

  const submit = useCallback(async () => {
    if (!input.trim() || isAiThinking) return;

    const userPrompt = input.trim();
    setSendError(null);
    setInput("");
    setRunType("design");

    try {
      // 1. Push user message to ai-chat feed
      await createFeedMessage("ai-chat", {
        sender: senderName,
        role: "user",
        content: userPrompt,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Failed to push user message to feed:", err);
    }

    try {
      // 2. Trigger the design run
      const designRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          roomId: projectId,
          projectId,
        }),
      });

      if (!designRes.ok) {
        throw new Error("Failed to trigger design agent");
      }

      const { runId } = await designRes.json();

      // 3. Retrieve public run token
      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to retrieve public token");
      }

      const { token } = await tokenRes.json();

      setActiveRunId(runId);
      setRunToken(token);
    } catch (err: unknown) {
      console.error("Failed to trigger design task:", err);
      setSendError("Failed to trigger design task. Please try again.");
      setRunType(null);

      // Push error message to ai-chat feed
      try {
        await createFeedMessage("ai-chat", {
          sender: "Ghost AI",
          role: "assistant",
          content: `Generation failed - ${getErrorMessage(err, "Failed to trigger design task")}`,
          timestamp: Date.now(),
        });
      } catch (feedErr) {
        console.warn("Failed to push error message to feed:", feedErr);
      }
    }
  }, [input, isAiThinking, createFeedMessage, senderName, projectId]);

  // Trigger technical spec generation
  const generateSpecAction = useCallback(async () => {
    if (isAiThinking) return;

    setSendError(null);
    setRunType("spec");

    try {
      // 1. Post user notification to chat feed
      await createFeedMessage("ai-chat", {
        sender: senderName,
        role: "user",
        content: "Generate a technical specification for the current system design.",
        timestamp: Date.now(),
      });

      // 2. Trigger spec generation task
      const specRes = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: projectId,
          chatHistory: validatedChatMessages,
          nodes,
          edges,
        }),
      });

      if (!specRes.ok) {
        throw new Error("Failed to trigger spec generation task");
      }

      const { runId } = await specRes.json();

      // 3. Retrieve public scoped run token
      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to retrieve public token for spec generation");
      }

      const { token } = await tokenRes.json();

      setActiveRunId(runId);
      setRunToken(token);
    } catch (err: unknown) {
      console.error("Failed to start spec generation:", err);
      setSendError("Failed to trigger spec generation. Please try again.");
      setRunType(null);

      // Post error back to feed
      try {
        await createFeedMessage("ai-chat", {
          sender: "Ghost AI",
          role: "assistant",
          content: `Spec generation failed - ${getErrorMessage(err, "Failed to trigger spec task")}`,
          timestamp: Date.now(),
        });
      } catch (feedErr) {
        console.warn("Failed to push error message to feed:", feedErr);
      }
    }
  }, [isAiThinking, createFeedMessage, senderName, projectId, validatedChatMessages, nodes, edges]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Sync run completion status to reset active run state and publish final feed message
  useEffect(() => {
    if (!run || !activeRunId) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED" || run.status === "CANCELED";

    if (isCompleted || isFailed) {
      const publishCompletionMessage = async () => {
        try {
          if (isCompleted) {
            await createFeedMessage("ai-chat", {
              sender: "Ghost AI",
              role: "assistant",
              content: runType === "spec"
                ? "Technical specification generated successfully!"
                : "System design architecture generated successfully!",
              timestamp: Date.now(),
            });
            // If it was a spec run, reload the specs list
            if (runType === "spec") {
              fetchSpecs();
            }
          } else {
            const errorMsg = getRunErrorMessage(run);
            await createFeedMessage("ai-chat", {
              sender: "Ghost AI",
              role: "assistant",
              content: `Generation failed - ${errorMsg}`,
              timestamp: Date.now(),
            });
          }
        } catch (err) {
          console.warn("Failed to post final AI status message:", err);
        } finally {
          setActiveRunId(null);
          setRunToken(null);
          setRunType(null);
        }
      };

      void publishCompletionMessage();
    }
  }, [run, activeRunId, createFeedMessage, runType, fetchSpecs]);

  // Load content of selected specification
  const loadSpecContent = useCallback(async (specId: string) => {
    setIsLoadingContent(true);
    setSpecError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs/${specId}/download`);
      if (!res.ok) {
        throw new Error("Failed to load specification content.");
      }
      const text = await res.text();
      setSpecContent(text);
    } catch (err: unknown) {
      console.error(err);
      setSpecError(getErrorMessage(err, "Failed to load spec content."));
    } finally {
      setIsLoadingContent(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedSpec) {
      void Promise.resolve().then(() => loadSpecContent(selectedSpec.id));
    }
  }, [selectedSpec, loadSpecContent]);

  const handleDownload = useCallback((specId: string) => {
    window.location.href = `/api/projects/${projectId}/specs/${specId}/download`;
  }, [projectId]);

  // Custom Markdown to HTML parser
  const parseMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return "";

    // Escape HTML first to prevent XSS
    const escaped = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const lines = escaped.split(/\r?\n/);
    const result: string[] = [];
    
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let inList = false;
    let paragraphBuffer: string[] = [];

    const flushParagraph = () => {
      if (paragraphBuffer.length > 0) {
        let content = paragraphBuffer.join(" ");
        content = processInlineStyles(content);
        result.push(`<p class="text-xs text-copy-primary leading-relaxed my-2">${content}</p>`);
        paragraphBuffer = [];
      }
    };

    const flushList = () => {
      if (inList) {
        inList = false;
      }
    };

    const processInlineStyles = (text: string): string => {
      // Bold (double asterisks)
      text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-copy-primary">$1</strong>');
      // Bold (single asterisks)
      text = text.replace(/\*([^*]+)\*/g, '<strong class="font-semibold text-copy-primary">$1</strong>');
      // Inline code
      text = text.replace(/`([^`]+)`/g, '<code class="bg-subtle px-1.5 py-0.5 rounded font-mono text-xs text-ai-text">$1</code>');
      return text;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle code block
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          result.push(`<pre class="bg-subtle p-3 rounded-lg font-mono text-xs my-3 overflow-x-auto border border-surface-border text-ai-text">${codeBuffer.join("\n")}</pre>`);
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          flushParagraph();
          flushList();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Handle Headers
      if (trimmed.startsWith("#")) {
        flushParagraph();
        flushList();
        
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = processInlineStyles(headerMatch[2]);
          if (level === 1) {
            result.push(`<h1 class="text-lg font-bold text-copy-primary mt-6 mb-3 pb-1 border-b border-surface-border">${content}</h1>`);
          } else if (level === 2) {
            result.push(`<h2 class="text-base font-bold text-copy-primary mt-5 mb-2.5 pb-1 border-b border-surface-border">${content}</h2>`);
          } else if (level === 3) {
            result.push(`<h3 class="text-sm font-bold text-copy-primary mt-4 mb-2 pb-1 border-b border-surface-border">${content}</h3>`);
          } else {
            result.push(`<h4 class="text-xs font-bold text-copy-primary mt-4 mb-1.5">${content}</h4>`);
          }
        } else {
          paragraphBuffer.push(line);
        }
        continue;
      }

      // Handle bullet lists
      const listMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
      if (listMatch) {
        flushParagraph();
        inList = true;
        const content = processInlineStyles(listMatch[2]);
        result.push(`<li class="ml-4 list-disc text-xs text-copy-primary my-1">${content}</li>`);
        continue;
      }

      // Handle numbered lists
      const numberedListMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (numberedListMatch) {
        flushParagraph();
        inList = true;
        const content = processInlineStyles(numberedListMatch[3]);
        result.push(`<li class="ml-4 list-decimal text-xs text-copy-primary my-1">${content}</li>`);
        continue;
      }

      // Handle empty lines (paragraph breaks)
      if (trimmed === "") {
        flushParagraph();
        flushList();
        continue;
      }

      // Accumulate text in paragraph
      paragraphBuffer.push(line);
    }

    flushParagraph();
    flushList();

    return result.join("\n");
  };

  return (
    <>
    <aside
      aria-hidden={!isOpen}
      className={`fixed right-3 top-[4.25rem] z-40 flex h-[calc(100vh-5rem)] w-[24rem] max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border border-surface-border bg-surface/95 p-4 shadow-2xl shadow-base/60 backdrop-blur transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1.5rem)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent-dim p-2">
            <Bot className="h-4 w-4 text-brand" />
          </div>
          <div>
            <div className="text-sm font-semibold text-copy-primary">AI Workspace</div>
            <div className="text-xs text-copy-muted">Collaborate with Ghost AI</div>
          </div>
        </div>

        <div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close AI sidebar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
        <Tabs defaultValue="architect" className="min-h-0 flex flex-1 flex-col">
          <TabsList className="mb-2 grid w-full grid-cols-2 bg-elevated/70">
            <TabsTrigger
              value="architect"
              className="text-xs text-copy-muted data-active:bg-accent-dim data-active:text-brand"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="text-xs text-copy-muted data-active:bg-accent-dim data-active:text-brand"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="architect" className="min-h-0 flex flex-1 flex-col justify-between gap-3">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {validatedChatMessages.length === 0 ? (
                <div className="flex min-h-full flex-col items-center justify-center gap-3 px-2 py-8 text-center">
                  <div className="rounded-2xl bg-accent-dim p-3">
                    <Bot className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-copy-primary">Ask Ghost AI to shape the canvas.</p>
                    <p className="mt-1 text-xs leading-relaxed text-copy-muted">Describe the system you want, then refine it with follow-up messages.</p>
                  </div>
 
                  <div className="mt-2 grid w-full gap-2">
                    <Button variant="ghost" size="sm" className="h-auto justify-start whitespace-normal rounded-xl bg-subtle px-3 py-2 text-left text-xs leading-snug text-brand hover:bg-accent-dim" onClick={() => setInput("Design an e-commerce backend")}>Design an e-commerce backend</Button>
                    <Button variant="ghost" size="sm" className="h-auto justify-start whitespace-normal rounded-xl bg-subtle px-3 py-2 text-left text-xs leading-snug text-brand hover:bg-accent-dim" onClick={() => setInput("Create a chat app architecture")}>Create a chat app architecture</Button>
                    <Button variant="ghost" size="sm" className="h-auto justify-start whitespace-normal rounded-xl bg-subtle px-3 py-2 text-left text-xs leading-snug text-brand hover:bg-accent-dim" onClick={() => setInput("Build a CI/CD pipeline")}>Build a CI/CD pipeline</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-1">
                  {validatedChatMessages.map((m) => {
                    const formattedTime = new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={m.id}
                        className={`flex max-w-[88%] flex-col gap-1.5 ${
                          m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <div className={`flex max-w-full items-center gap-1.5 px-1 text-[10px] text-copy-muted ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}>
                          <span className="truncate font-medium text-copy-secondary">{m.sender}</span>
                          <span>-</span>
                          <span>{formattedTime}</span>
                        </div>
                        <div
                          className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm wrap-break-words ${
                            m.role === "user"
                              ? "rounded-br-md bg-brand text-primary-foreground"
                              : "rounded-bl-md border border-surface-border bg-elevated text-copy-primary"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="flex-none w-full border-t border-surface-border pt-3">
              {sendError && (
                <div className="mb-2 text-xs text-state-error px-1">
                  {sendError}
                </div>
              )}
              {isAiThinking && (
                <div className="mb-2 flex items-center gap-2 rounded-xl border border-brand/20 bg-accent-dim px-3 py-2 text-xs text-brand">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
                  <span className="min-w-0 truncate">
                    {statusText ? `Ghost AI: ${statusText}` : "Ghost AI is thinking..."}
                  </span>
                </div>
              )}
              <div className="flex items-end gap-2 rounded-2xl border border-surface-border bg-elevated/60 p-2 focus-within:border-brand/40">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAiThinking}
                  placeholder={isAiThinking ? "Ghost AI is generating..." : "Ask Ghost AI..."}
                  className="min-h-[52px] max-h-[140px] flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm text-copy-primary shadow-none placeholder:text-copy-muted focus-visible:border-0 focus-visible:ring-0 disabled:bg-transparent"
                />
                <Button
                  variant="default"
                  size="icon"
                  className={`h-9 w-9 rounded-xl bg-brand text-primary-foreground transition-all hover:bg-brand/90 ${
                    isAiThinking ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  onClick={submit}
                  disabled={!input.trim() || isAiThinking}
                  aria-label={isAiThinking ? "Generating response" : "Send message"}
                >
                  {isAiThinking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                  ) : (
                    <Send className="h-4 w-4 text-primary-foreground" />
                  )}
                </Button>
              </div>
              <div className="mt-2 px-1 text-[10px] text-copy-faint">Enter sends. Shift+Enter adds a new line.</div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="min-h-0 flex flex-1 flex-col justify-between gap-3">
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <div className="mb-4 flex items-center justify-between gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-brand text-primary-foreground hover:bg-brand/90 rounded-xl animate-none"
                  onClick={generateSpecAction}
                  disabled={isAiThinking}
                >
                  {runType === "spec" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Spec
                    </>
                  )}
                </Button>
              </div>

              {isLoadingSpecs ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-brand" />
                </div>
              ) : specs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <div className="rounded-full bg-elevated/40 p-3">
                    <FileText className="h-6 w-6 text-copy-muted" />
                  </div>
                  <p className="text-xs text-copy-muted">No specifications generated yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {specs.map((spec) => {
                    const formattedDate = new Date(spec.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const formattedTime = new Date(spec.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const filename = `spec-${spec.id.substring(0, 8)}.md`;

                    return (
                      <div
                        key={spec.id}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-elevated/45 p-3 hover:bg-elevated/80 hover:border-brand/20 transition-all cursor-pointer"
                        onClick={() => setSelectedSpec(spec)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="rounded-lg bg-surface p-2 text-brand">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-copy-primary group-hover:text-brand transition-colors">
                              {filename}
                            </div>
                            <div className="text-[10px] text-copy-muted mt-0.5">
                              {formattedDate} at {formattedTime}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-surface text-copy-secondary hover:text-brand"
                            onClick={() => setSelectedSpec(spec)}
                            title="Preview specification"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-surface text-copy-secondary hover:text-brand"
                            onClick={() => handleDownload(spec.id)}
                            title="Download spec"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>

    <Dialog open={!!selectedSpec} onOpenChange={(open) => { if (!open) setSelectedSpec(null); }}>
      <DialogContent className="sm:max-w-2xl w-full h-[80vh] flex flex-col p-6 rounded-3xl bg-surface/95 border border-surface-border shadow-2xl backdrop-blur">
        <DialogHeader className="flex-none">
          <DialogTitle className=" font-semibold text-copy-primary">
            {selectedSpec ? `spec-${selectedSpec.id.substring(0, 8)}.md` : "Specification Preview"}
          </DialogTitle>
          <DialogDescription className="text-xs text-copy-muted">
            Generated on {selectedSpec && new Date(selectedSpec.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 border-t border-b border-surface-border py-4">
          {isLoadingContent ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : specError ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-state-error">{specError}</p>
              <Button variant="outline" size="sm" onClick={() => selectedSpec && loadSpecContent(selectedSpec.id)}>
                Retry
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div
                className="prose prose-invert prose-sm max-w-none text-copy-primary [&_*]:text-copy-primary [&_code]:text-ai-text [&_h1]:text-lg [&_h1]:!text-copy-primary [&_h2]:text-base [&_h2]:!text-copy-primary [&_h3]:text-sm [&_h3]:!text-copy-primary [&_h4]:!text-copy-primary [&_li]:!text-copy-primary [&_p]:!text-copy-primary [&_p]:leading-relaxed [&_pre]:border [&_pre]:border-surface-border [&_pre]:!text-ai-text [&_strong]:!text-copy-primary"
                dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(specContent) }}
              />
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="flex-none flex items-center justify-between gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-surface-border text-copy-secondary"
            onClick={() => setSelectedSpec(null)}
          >
            Close
          </Button>
          {selectedSpec && (
            <Button
              variant="default"
              size="sm"
              className="bg-brand text-primary-foreground hover:bg-brand/90 rounded-xl"
              onClick={() => handleDownload(selectedSpec.id)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download spec
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}

export default AiSidebar;
