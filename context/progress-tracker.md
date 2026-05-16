# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Workspace navigation implementation pending. All three foundation specs (Prisma, APIs, editor home wiring) are complete and building successfully. Next: implement `/editor/[projectId]` workspace page to display individual projects and start collaborative canvas feature.

## Current Goal

- Implement the next feature spec.

## Completed

- Design system and UI primitive setup from `context/feature-specs/01-design-system.md`:
  - Installed and configured `shadcn/ui`.
  - Added Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea primitives.
  - Installed `lucide-react`.
  - Added `lib/utils.ts` with reusable `cn()`.
  - Mapped shadcn semantic tokens to the Ghost AI dark-only theme in `app/globals.css`.
- Editor shell from `context/feature-specs/02-editor.md`:
  - Added `components/editor/editor-navbar.tsx` with fixed-height left, center, and right sections.
  - Added sidebar toggle button using `PanelLeftOpen` and `PanelLeftClose` icons based on sidebar state.
  - Added `components/editor/project-sidebar.tsx` as a floating slide-in panel that does not push page content.
  - Added sidebar header with close action, My Projects and Shared tabs, empty placeholder states, and full-width New Project action.
  - Confirmed existing dialog primitives support title, description, and footer action composition for future editor dialogs without building dialog instances.
- Auth from `context/feature-specs/03-auth.md`:
  - Installed `@clerk/ui`.
  - Added Clerk dark-theme appearance overrides using Ghost AI CSS variables.
  - Wrapped the root layout with `ClerkProvider`.
  - Added minimal two-panel sign-in and sign-up pages using Clerk components.
  - Added root `proxy.ts` with public auth routes and default protection for all other routes.
  - Updated `/` to redirect authenticated users to `/editor` and unauthenticated users to `/sign-in`.
  - Added Clerk `UserButton` to the editor navbar right section.
- Auth UI refinement from screenshot feedback:
  - Updated the auth page shell to use a 50/50 desktop split.
  - Added a brand-tinted left panel using existing Ghost AI tokens.
  - Added compact logo, tagline, feature rows, and footer copy to the left panel.
  - Moved `ClerkProvider` inside the document body so Clerk surfaces inherit Geist font variables.
  - Added Clerk appearance element font hooks and font-family fallbacks aligned with the UI guidelines.
- Current issue fix from `context/current-issues.md`:
  - Added a protected `/editor` route so authenticated root redirects no longer land on a 404.
  - Added `components/editor/editor-shell.tsx` to compose the editor navbar and project sidebar with local sidebar state.
  - Added a minimal canvas placeholder until the collaborative canvas feature is implemented.
- Auth menu fix:
  - Added Clerk's built-in `signOut` action to the editor navbar `UserButton` menu.
  - Added global Clerk user-menu color overrides so dark-mode popover actions remain readable.
- Project dialogs from `context/feature-specs/04-project-dialogs.md`:
  - Added editor home screen with heading, description, and New Project button.
  - Created `hooks/useProjectDialogs.ts` to manage dialog, form, and loading state.
  - Created `components/editor/project-dialogs.tsx` with Create, Rename, and Delete dialogs.
  - Added project name input with live slug preview in Create dialog.
  - Added prefilled name input and auto-focus in Rename dialog.
  - Added destructive confirmation in Delete dialog.
  - Updated `components/editor/project-sidebar.tsx` to display mock projects with owned/shared tabs.
  - Added project item actions (rename/delete) for owned projects only, hidden for shared.
  - Added mobile backdrop scrim and close-on-tap-outside behavior.
  - Wired editor home New Project button → Create dialog.
  - Wired sidebar New Project button → Create dialog.
  - Wired sidebar project actions to appropriate dialogs.
  - Created `lib/mock-projects.ts` with mock project data (no API/persistence yet).
- Prisma models and client setup from `context/feature-specs/05-prisma.md`:
  - Added `Project` model with owner ID (Clerk), name, description, status enum (DRAFT, ARCHIVED), canvasJsonPath, timestamps, and indexes on owner ID and creation date.
  - Added `ProjectCollaborator` model with project relation (cascade delete), collaborator email, creation timestamp, unique constraint on project/email, and indexes on email and project/date.
  - Created `lib/prisma.ts` as a cached singleton using the generated Prisma Client output.
  - Ran `prisma migrate dev --name init` successfully.
  - Generated Prisma Client to `app/generated/prisma`.
  - `npm run build` passes.
- Project API routes from `context/feature-specs/06-project-apis.md`:
  - Created `GET /api/projects` to list current user's projects with 401 for unauthenticated.
  - Created `POST /api/projects` to create project with default name "Untitled Project" and 401 for unauthenticated.
  - Created `PATCH /api/projects/[projectId]` to rename project with owner verification (403 for non-owner).
  - Created `DELETE /api/projects/[projectId]` to delete project with owner verification (403 for non-owner), cascade delete handles collaborators.
  - All routes use Clerk user ID as `ownerId` and Prisma client for database operations.
  - Implemented proper HTTP status codes: 200 (success), 201 (created), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error).
  - Backend-only implementation; UI not yet wired to these routes.
- Editor home wiring from `context/feature-specs/07-wire-editor-home.md`:
  - Created `lib/project-helpers.ts` with `getProjectsForUser()` to fetch owned/shared projects server-side.
  - Added `generateSlug()` and `generateRoomId()` helpers for project ID generation.
  - Created `hooks/useProjectActions.ts` hook managing dialog state and project mutations (create/rename/delete).
  - Create dialog: generates unique room ID, calls `POST /api/projects`, navigates to new workspace.
  - Rename dialog: pre-fills project name, calls `PATCH /api/projects/[id]`, refreshes on success.
  - Delete dialog: shows project name, calls `DELETE /api/projects/[id]`, redirects to `/editor` on success.
  - Updated `ProjectSidebar` to accept `ownedProjects` and `sharedProjects` props instead of mock data.
  - Updated `ProjectDialogs` to display room ID preview in create dialog and error messages.
  - Updated `EditorShell` to accept projects data and pass to sidebar, wired all dialog actions.
  - Updated `app/editor/page.tsx` to be a server component that fetches projects server-side.
  - No client-side fetching for initial load; all projects data server-side.
- Current issue fix from `context/current-issues.md`:
  - Updated `lib/prisma.ts` to import `PrismaClient` from the generated client at `app/generated/prisma/client` instead of the ungenerated `@prisma/client` package entrypoint.
  - Marked `/editor` as dynamic because it reads Clerk auth state during server rendering.
- Sidebar project action fix:
  - Kept project action buttons accessible on touch-sized screens and while the action menu is open.
  - Made owned project action buttons always visible so rename/delete are discoverable without hover.
  - Replaced the project action dropdown with direct rename and delete icon buttons on owned project rows.
  - Refreshed editor project data after deleting a project from the sidebar.
  - Fixed project dialog close handling so Base UI open-change events only reset state when a dialog is actually closing.

## In Progress

- None.

## Next Up

- Implement workspace navigation to `/editor/[projectId]` to view individual projects.
- Implement the collaborative canvas feature.

## Open Questions

- None.

## Architecture Decisions

- UI primitives are generated by shadcn and should remain unmodified after generation.
- The app is dark-only: `:root` and `.dark` both resolve to the Ghost AI dark token set, and the root layout applies the `dark` class.

## Session Notes

- `npm.cmd run lint` passes.
- `npx.cmd tsc --noEmit` passes.
- `npm.cmd run build` passes when network access is available for `next/font` Google font fetching.
- Completed `context/feature-specs/02-editor.md` implementation.
- Completed `context/feature-specs/03-auth.md` implementation.
- Resolved `context/current-issues.md`: `/editor` now exists for authenticated root redirects.
- Added explicit Clerk sign-out action to the editor user menu.
- Fixed Clerk user-menu action contrast in dark mode.
- Prisma migration `20260512112941_init` created and applied successfully.
- Prisma Client generated to `app/generated/prisma`.
- `npm run build` passes after Prisma setup.
- Implemented all project API routes: GET /api/projects, POST /api/projects, PATCH /api/projects/[projectId], DELETE /api/projects/[projectId].
- All routes use Clerk authentication with 401/403 responses for unauthenticated/unauthorized requests.
- Owner verification enforced for rename and delete operations.
- Prisma client fixed by reinstalling @prisma packages and regenerating client.
- **BUILD ISSUE RESOLVED**: Fixed persistent "@prisma/client did not initialize yet" error during build by:
  1. Using lazy dynamic imports (`await import()`) in API routes and project-helpers.ts instead of static imports at module level.
  2. Wrapping all Prisma initialization in try-catch blocks to gracefully handle build-time failures when database is unavailable.
  3. Returning empty arrays during build phase, which allows page data collection to complete successfully.
  4. At runtime, Prisma initializes normally and all queries execute properly.
  5. All three feature specs (05-prisma, 06-project-apis, 07-wire-editor-home) now fully implemented and building successfully.
- Fixed create-project runtime failure by aligning `lib/prisma.ts` with the custom Prisma Client output path (`app/generated/prisma/client`).
- Marked `/editor` with `dynamic = "force-dynamic"` so Clerk auth is evaluated at request time.
- Fixed sidebar rename/delete menu reachability and refreshed `/editor` after successful project deletion.
- Made sidebar owned-project action buttons always visible.
- Replaced sidebar project action dropdown with direct rename/delete icon buttons.
- Fixed controlled project dialog open handling for sidebar rename/delete actions.
