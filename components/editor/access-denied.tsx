import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AccessDenied() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-ghost-900">
      <div className="flex flex-col items-center gap-6 text-center">
        <Lock className="h-16 w-16 text-ghost-400" />
        <div>
          <h1 className="text-2xl font-semibold text-ghost-50">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-ghost-300">
            You don&apos;t have permission to view this project.
          </p>
        </div>
        <Link href="/editor">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
    </div>
  );
}
