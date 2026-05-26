"use client";

import { useCallback, useState } from "react";
import { X, Bot, FileText, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{
    id: string;
    role: "user" | "assistant";
    text: string;
  }[]>([]);

  const submit = useCallback(() => {
    if (!input.trim()) return;
    const id = String(Date.now());
    setMessages((m) => [...m, { id, role: "user", text: input.trim() }]);
    setInput("");
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <aside
      aria-hidden={!isOpen}
      className={`fixed right-3 top-17 z-40 flex h-[calc(100vh-5rem)] w-80 max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border border-surface-border bg-surface/95 p-4 shadow-2xl shadow-base/60 backdrop-blur transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1.5rem)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-elevated/60 p-2">
            <Bot className="h-4 w-4 text-accent" />
          </div>
          <div>
            <div className="text-sm font-semibold text-primary-text">AI Workspace</div>
            <div className="text-xs text-muted-text">Collaborate with Ghost AI</div>
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
          <TabsList className="mb-2">
            <TabsTrigger
              value="architect"
              className="text-muted-text data-active:bg-accent data-active:text-accent"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="text-muted-text data-active:bg-accent data-active:text-accent"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="architect" className="min-h-0 flex flex-1 flex-col justify-between gap-3">
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col items-center justify-center gap-3 py-6 text-center">
                  <div className="rounded-full bg-elevated/40 p-3">
                    <Bot className="h-6 w-6 text-accent" />
                  </div>
                  <p className="text-sm text-copy-muted">Start a conversation with the AI to get architecture suggestions.</p>

                  <div className="mt-2 flex flex-col gap-2">
                    <Button variant="ghost" size="sm" className="bg-subtle text-accent-text">Design an e-commerce backend</Button>
                    <Button variant="ghost" size="sm" className="bg-subtle text-accent-text">Create a chat app architecture</Button>
                    <Button variant="ghost" size="sm" className="bg-subtle text-accent-text">Build a CI/CD pipeline</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-full break-words ${m.role === "user" ? "ml-auto text-right" : "mr-auto text-left"}`}
                    >
                      <div
                        className={`inline-block rounded-lg px-3 py-2 text-sm ${
                          m.role === "user"
                            ? "bg-brand-dim border-brand/50 border-2 text-copy-primary"
                            : "bg-elevated border border-surface-border text-accent-text"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-none w-full border-t border-surface-border pt-3">
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Ghost AI... (Enter to send, Shift+Enter for newline)"
                  className="min-h-[72px] max-h-[160px] resize-none flex-1 text-copy-primary placeholder:text-copy-muted"
                />
                <Button
                  variant="default"
                  size="sm"
                  className="bg-accent text-white"
                  onClick={submit}
                  disabled={!input.trim()}
                >
                  <Send className="mr-1 h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="min-h-0 flex flex-1 flex-col justify-between gap-3">
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <div className="mb-4">
                <Button variant="default" size="sm" className="bg-accent text-white">Generate Spec</Button>
              </div>

              <div className="rounded-lg bg-elevated p-3 border border-surface-border">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-surface p-2">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Demo Spec: E-commerce Backend</div>
                    <div className="text-xs text-copy-muted mt-1">A short spec snippet demonstrating structure and endpoints.</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <Button variant="ghost" size="sm" disabled>Download</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}

export default AiSidebar;
