import { SignUp } from "@clerk/nextjs"

import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { clerkAppearance } from "@/lib/clerk-appearance"

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUp appearance={clerkAppearance} />
    </AuthPageShell>
  )
}
