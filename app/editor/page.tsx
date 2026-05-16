import { EditorShell } from "@/components/editor/editor-shell"
import { getProjectsForUser, type Project } from "@/lib/project-helpers"

export const dynamic = "force-dynamic"

export default async function EditorPage() {
  let ownedProjects: Project[] = []
  let sharedProjects: Project[] = []

  try {
    const projects = await getProjectsForUser()
    ownedProjects = projects.ownedProjects
    sharedProjects = projects.sharedProjects
  } catch (error) {
    console.error('Failed to fetch projects:', error)
    // Return empty projects on error - will be populated at runtime
  }

  return (
    <EditorShell 
      ownedProjects={ownedProjects} 
      sharedProjects={sharedProjects} 
    />
  )
}
