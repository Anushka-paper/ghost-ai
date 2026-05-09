import type { ReactNode } from "react"
import { BrainCircuit, FileText, Users } from "lucide-react"

interface AuthPageShellProps {
  children: ReactNode
}

const features = [
  {
    description:
      "Describe your system, AI maps it to nodes and edges on a live canvas.",
    icon: BrainCircuit,
    title: "AI Architecture Generation",
  },
  {
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
    icon: Users,
    title: "Real-time Collaboration",
  },
  {
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
    icon: FileText,
    title: "Instant Spec Generation",
  },
]

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <main className="grid min-h-screen bg-base font-sans text-copy-primary lg:grid-cols-2">
      <section className="hidden border-r border-surface-border bg-accent-dim px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div>
          <div className="flex items-center gap-4">
            <div
              className="size-9 rounded-xl border border-brand/30 bg-brand shadow-lg shadow-brand/10"
              aria-hidden="true"
            />
            <div className="text-lg font-semibold text-copy-primary">
              Ghost AI
            </div>
          </div>

          <div className="mt-28 max-w-xl">
            <h1 className="text-4xl font-semibold leading-tight text-copy-primary">
              Design systems at the speed of thought.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-copy-secondary">
              Describe your architecture in plain English. Ghost AI maps it to
              a shared canvas your whole team can refine in real time.
            </p>
          </div>

          <div className="mt-16 space-y-9">
            {features.map(({ description, icon: Icon, title }) => (
              <div className="flex max-w-xl gap-5" key={title}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-brand/35 bg-brand/10 text-brand">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-copy-primary">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-copy-muted">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-copy-faint">
          (c) 2026 Ghost AI. All rights reserved.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-base px-5 py-10 font-sans">
        {children}
      </section>
    </main>
  )
}
