import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

function routePathFromEnv(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback
  }

  try {
    const pathname = new URL(value).pathname
    return pathname === "/" ? fallback : pathname.replace(/\/$/, "")
  } catch {
    return value.startsWith("/") ? value.replace(/\/$/, "") : fallback
  }
}

const signInPath = routePathFromEnv(
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  "/sign-in"
)
const signUpPath = routePathFromEnv(
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  "/sign-up"
)

const isPublicRoute = createRouteMatcher([
  `${signInPath}(.*)`,
  `${signUpPath}(.*)`,
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
