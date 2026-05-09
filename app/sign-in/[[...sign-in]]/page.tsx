import { SignIn } from "@clerk/nextjs"

import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { clerkAppearance } from "@/lib/clerk-appearance"

export default function SignInPage() {
  return (
    <AuthPageShell>
      <SignIn appearance={clerkAppearance} />
    </AuthPageShell>
  )
}
