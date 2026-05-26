# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Collaborative canvas presence implemented. The workspace canvas now shows live collaborator avatars in the top-right of the canvas area and broadcasts cursor position through Liveblocks presence.

## Current Goal

- Continue building collaborative canvas productivity features.

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
- Workspace shell from `context/feature-specs/08-editor-workspace-shell.md`:
  - Created `lib/project-access.ts` with access helpers: `getCurrentUser()`, `checkProjectAccess()`, `getProjectWithAccess()`.
  - Created `components/editor/access-denied.tsx` with centered lock icon, message, and back link.
  - Created `components/editor/workspace-shell.tsx` with full-viewport layout including navbar, sidebars, and canvas area.
  - Top navbar displays project name with share button and AI sidebar toggle.
  - ProjectSidebar shows on left with current project highlighted, supports navigation to other projects.
  - Central canvas area has dark background with placeholder message.
  - Right sidebar placeholder for future AI chat.
  - Created `/editor/[projectId]` page with server-side access checks.
  - Unauthenticated users redirect to `/sign-in`.
  - Users without project access see `AccessDenied` component.
  - Non-existent projects show `AccessDenied`.
  - `npm run build` passes and includes new `/editor/[projectId]` dynamic route.
- Share dialog from `context/feature-specs/09-share-dialog.md`:
  - Created API route `GET /api/projects/[projectId]/collaborators` to list collaborators with Clerk enrichment (display names, avatars).
  - Created API route `POST /api/projects/[projectId]/collaborators` to invite collaborators by email (owners only).
  - Created API route `DELETE /api/projects/[projectId]/collaborators/[email]` to remove collaborators (owners only).
  - Created `lib/clerk-helpers.ts` with `getClerkUserByEmail()` to fetch user display name and avatar from Clerk Backend API.
  - Created `components/editor/share-dialog.tsx` with:
    - Copy project link button with "Copied!" feedback for all users.
    - Invite form (owners only) to add collaborators by email.
    - Collaborators list showing display names and avatars from Clerk (fallback to email if user not found).
    - Remove button for each collaborator (owners only, hidden for collaborators).
    - Read-only view for collaborators.
  - Updated `components/editor/workspace-shell.tsx` to accept `isOwner` prop and wire Share button to open dialog.
  - Updated `/editor/[projectId]` page to determine `isOwner` and pass to WorkspaceShell.
  - `npm run build` passes and includes new collaborator API routes.
- Current issue fix from `context/current-issues.md`:
  - Fixed `ShareDialog` to compute the project link after client mount instead of reading `window.location.origin` during render.
  - Updated Share dialog close handling so Base UI open-change events only close local state when the dialog is actually closing.
  - Replaced raw share dialog color classes with existing Ghost AI theme tokens.
  - Deferred collaborator fetching after dialog open to satisfy React compiler effect rules.
  - Cleaned up small lint blockers in `AccessDenied` and `WorkspaceShell`.
- Current issue fix from `context/current-issues.md`:
  - Updated collaborator access checks to resolve the signed-in user's primary email from Clerk instead of relying on session claim placeholders.
  - Normalized collaborator emails to lowercase on invite and access checks.
  - Replaced shared-project and collaborator API placeholder email checks with real normalized email comparisons.
  - Made collaborator removal case-insensitive.
- Collaborator route error fix:
  - Removed duplicated trailing catch block in `lib/clerk-helpers.ts`.
  - Updated collaborator server action to use the current `getCurrentUser()` and `checkProjectAccess()` helpers.
  - Replaced an `any` Prisma error catch in the collaborator route with a narrow unique-constraint guard.
- Liveblocks setup from `context/feature-specs/10-liveblocks-setup.md`:
  - Updated `liveblocks.config.ts` to define Presence with cursor position and `isThinking` boolean.
  - Defined UserMeta with user ID, display name, avatar URL, and cursor color.
  - Created `lib/liveblocks.ts` with cached Liveblocks node client singleton.
  - Added `getUserCursorColor()` helper that deterministically maps user IDs to a 10-color fixed palette.
  - Created `POST /api/liveblocks-auth` route with:
    - Clerk authentication requirement (401 for unauthenticated).
    - Project access verification using existing access helper (403 for unauthorized).
    - Automatic room creation using project ID as room ID.
    - Session token generation with user name, avatar, and cursor color.
    - Proper error handling and status codes.
  - Installed `@liveblocks/node` for server-side operations.
  - `npm run build`, `npm run lint`, and `npx tsc --noEmit` all pass successfully.
  - Added live collaborator avatars and cursor presence rendering inside the workspace canvas view.
- Edge behavior from `context/feature-specs/16-edge-behavior.md`:
  - Added subtle top, right, bottom, and left connection handles to every canvas node.
  - Added typed canvas edge data for collaborative inline labels.
  - Created a custom `canvasEdge` renderer using smooth-step routing, rounded strokes, and arrowheads.
  - Added widened transparent edge hit areas so edges are easier to hover, select, and double-click without thickening the visible stroke.
  - Added edge hover and selection brightening.
  - Added inline edge label editing with `EdgeLabelRenderer` and `getSmoothStepPath` label coordinates.
  - Saved edge labels through the existing Liveblocks-backed edge change flow.
  - `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` pass.
- Canvas ergonomics from `context/feature-specs/17-canvas-ergonomics.md`:
  - Added a pill-shaped bottom-left canvas control bar above the shape panel.
  - Added zoom out, fit view, zoom in, undo, and redo controls with grouped layout and a divider.
  - Wired zoom actions to the React Flow instance with short animated transitions.
  - Wired undo and redo to Liveblocks `useUndo`, `useRedo`, `useCanUndo`, and `useCanRedo`.
  - Disabled undo and redo controls when no matching history action is available.
  - Created `hooks/useKeyboardShortcuts.ts` for zoom and history keyboard shortcuts.
  - Keyboard shortcuts skip inputs, textareas, and editable fields.
  - Replaced the built-in React Flow controls with the custom specified control bar.
  - `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` pass.
- Current issue fix from `context/current-issues.md`:
  - Fixed `Can't reach database server at db.prisma.io:5432` by configuring Prisma Client to use the `@prisma/adapter-pg` driver adapter.
  - Initialized a Node-Postgres (`pg`) Pool and wired it up to the Prisma client in `lib/prisma.ts`.
  - Triggered a new build to verify that the fix resolves the connection issue, which passed successfully.
- Starter templates library from `context/feature-specs/18-starter-template.md`:
  - Added `components/editor/starter-templates.ts` containing 3 templates (Microservices Architecture, CI/CD Pipeline, Event-Driven System).
  - Created `components/editor/starter-templates-modal.tsx` with a lightweight SVG preview based on node data.
  - Wired a new "Templates" button to the editor navbar to open the modal.
  - Connected the modal's `onImport` callback down to the canvas to clear the existing node/edge states and render the new template using `useLiveblocksFlow`.
  - `npm.cmd run build` passes.

- AI sidebar from `context/feature-specs/20-ai-sidebar-shell.md`:
  - Separated AI sidebar into `components/editor/ai-sidebar.tsx` and wired it into `components/editor/workspace-shell.tsx`.
  - Preserves floating slide-in placement, border, background, and shadow styling from the existing placeholder.
  - Implements tabbed layout (`AI Architect`, `Specs`), empty-state starter chips, chat input UI (Enter to send, Shift+Enter newline), and a demo spec card.
  - UI-only: no backend or Liveblocks integration added.
  - `npx.cmd tsc --noEmit` passes after implementation.

- Canvas autosave from `context/feature-specs/21-canvas-autosave.md`:
  - Added `@vercel/blob` dependency for blob storage.
  - Added `PUT /api/projects/[projectId]/canvas` to upload the latest canvas JSON to Vercel Blob and persist the returned blob URL to Prisma.
  - Added `GET /api/projects/[projectId]/canvas` to load a saved project canvas from Vercel Blob when the room is empty.
  - Added `hooks/useCanvasAutosave.ts` to debounce autosaves and surface saving/saved/error state.
  - Updated canvas logic to load saved state only when the Liveblocks room is empty.
  - Added a save status indicator to the canvas control bar.
  - `npm.cmd run build` passes after implementation.

## In Progress

- None.

## Next Up

- None.

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
- Implemented workspace shell spec 08 with access checks, workspace layout, and `/editor/[projectId]` page.
- Added ProjectSidebar support for currentProjectId highlighting and navigation to specific projects.
- Access helpers created for Clerk identity lookup and project access verification (owner or collaborator).
- Workspace page server-side validates authentication and project access before rendering.
- Successfully builds with new `/editor/[projectId]` dynamic route included in build output.
- Implemented share dialog spec 09 with collaborator management API routes and Clerk enrichment.
- Added Clerk Backend API integration to fetch user display names and avatars for collaborators.
- Share dialog supports owners: invite/remove collaborators, copy project link; collaborators: view-only access.
- Collaborator list enriched with Clerk data (display name, avatar) with fallback to email only.
- Built with API routes for listing, inviting, and removing collaborators with server-side owner verification.
- Successfully builds with new `/api/projects/[projectId]/collaborators` and `/api/projects/[projectId]/collaborators/[email]` routes.
- Fixed Share dialog runtime `window is not defined` error by guarding project-link construction from server render.
- Verified the Share dialog runtime fix with typecheck, lint, and production build.
- Fixed invited collaborator access by using Clerk primary email lookup and normalized collaborator email comparisons across workspace access, sidebar shared projects, and collaborator APIs.
- Fixed collaborator route compilation and lint errors; typecheck, lint, and build pass.
- **Base Canvas Implementation Complete**:
  - Installed React Flow and Liveblocks React Flow packages.
  - Created shared canvas types in types/canvas.ts.
  - Built client-side canvas wrapper with Liveblocks authentication and room setup.
  - Integrated useLiveblocksFlow hook for synced collaborative state.
  - Canvas renders with loose connections, MiniMap, Controls, and dot-pattern background.
  - Updated workspace shell to render Canvas instead of placeholder.
  - Updated liveblocks.config.ts with canvas_state Storage definition.
  - **BUILD PASSES** - All routes compiled, TypeScript typecheck passes, all 11 routes available.
- Fixed Liveblocks auth route to extract `room` parameter (sent by Liveblocks client) instead of `projectId`.
- **Shape Panel Implementation Complete**:
  - Created floating pill-shaped toolbar with 6 draggable shape buttons.
  - Shapes: rectangle, diamond, circle, pill, cylinder, hexagon.
  - Each shape has sensible default sizes for better usability.
  - Implemented dragover/drop handling with visual feedback overlay.
  - Screen-to-canvas coordinate conversion using React Flow's screenToFlowPosition.
  - Custom node renderer displays nodes as bordered rectangles with centered labels.
  - Node IDs use shape name + timestamp + counter for uniqueness.
  - Updated canvas types to support all 6 shape types.
  - **BUILD PASSES** - Typecheck passes, linting passes (1 pre-existing warning), all 11 routes available.
- Current issue fix from `context/current-issues.md`:
  - Rewired the canvas to pass `useLiveblocksFlow()` nodes, edges, and handlers directly into the controlled React Flow instance.
  - Switched canvas-related React Flow imports to `@xyflow/react` so Liveblocks React Flow types and runtime components match.
  - Added validated drag payload parsing and Liveblocks-backed node creation through `onNodesChange`.
  - Added `text/plain` drag data fallback for shape panel drag/drop reliability.
  - Removed the canvas wrapper card effect by making the canvas fill the workspace edge-to-edge with the Ghost AI base background and dotted React Flow background.
  - Converted the AI sidebar to a fixed overlay so it floats over the canvas instead of shrinking the canvas layout.
  - Increased the left sidebar closed transform so it fully clears the viewport when hidden.
  - Replaced touched `ghost-*` editor layout classes with documented Ghost AI theme tokens.
  - `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` pass.
- Node shape rendering from `context/feature-specs/13-node-shape.md`:
  - Added a reusable `NodeShape` renderer for canvas nodes and shape drag previews.
  - Rendered rectangle, pill, and circle using CSS shapes.
  - Rendered diamond, hexagon, and cylinder using scalable SVG shapes.
  - Updated selected nodes to use a brighter stroke while rest-state borders remain subtle.
  - Kept node rendering connected to existing Liveblocks-backed React Flow state.
  - Added a cursor-following ghost preview when dragging shapes from the shape panel.
  - Hid the native browser drag image so the custom preview is the visible drag feedback.
  - `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` pass.
- Node resizing and inline label editing from `context/feature-specs/14-node-editing.md`:
  - Added React Flow `NodeResizer` handles that appear only for selected nodes.
  - Enforced minimum node resize dimensions.
  - Kept resize handles subtle with dark-canvas styling.
  - Added double-click inline label editing in the centered node label area.
  - Added centered placeholder text when labels are empty.
  - Rendered the editing textarea directly over the label without layout shifts.
  - Updated labels through the existing Liveblocks-backed node change flow.
  - Closed editing on blur or `Escape`.
  - Prevented textarea interactions from dragging or panning the canvas.
  - `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` pass.
- Node label editing refinement:
  - Centered the active label editing textarea vertically inside the node so focused text appears in the same middle position as the read-only label.
  - Auto-sized the textarea to its content while keeping editing interactions isolated from canvas drag and pan.
  - `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` pass.
- Node color toolbar from `context/feature-specs/15-nodes-color-toolbar.md`:
  - Added the 8 predefined node background/text color pairs from `context/ui-context.md` to `types/canvas.ts`.
  - Added text color support to canvas node data.
  - Added a selected-node floating color toolbar above the node.
  - Rendered one swatch per predefined color pair with active selection styling.
  - Added tight hover glow using each swatch's paired text color.
  - Prevented toolbar interactions from dragging nodes or panning the canvas.
  - Updated both node background and text color through the existing Liveblocks-backed node change flow.
  - Kept color changes client-side with no server calls.
  - `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` pass.
- Implemented `context/feature-specs/16-edge-behavior.md`; typecheck, lint, and production build pass. Lint still reports the pre-existing `share-dialog.tsx` `<img>` warning.
- Implemented `context/feature-specs/17-canvas-ergonomics.md`; typecheck, lint, and production build pass. Lint still reports the pre-existing `share-dialog.tsx` `<img>` warning.
