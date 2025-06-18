"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  FolderClosed,
  Plus
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { AddProjectDialog } from "./add-project-dialog";
import { ConfirmAlertDialog } from "./confirm-alert-dialog";
import { toast } from "sonner";

type Projects = {
  id: string
  name: string
  description: string
}[]

interface NavProjectsProps {
  projects: Projects
  activeProject: any
  setActiveProject: (project: any) => void
  activeOrg: any
  onProjectDeleted?: () => void
}

export function NavProjects({
  projects,
  activeProject,
  setActiveProject,
  activeOrg,
  onProjectDeleted
}: NavProjectsProps) {
  const { isMobile } = useSidebar()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showProjectDeleteDialog, setShowProjectDeleteDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<{id: string, name: string} | null>(null)
  const [isDeletingProject, setIsDeletingProject] = useState(false)

  if (!projects || !Array.isArray(projects)) {
    return null
  }

  const handleAddProject = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDialogOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    
    setIsDeletingProject(true)
    try {
      const response = await fetch(`/api/v1/projects?projectId=${projectToDelete.id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      const result = await response.json()
      console.log('Project deleted:', result)
      
      toast(`Project "${projectToDelete.name}" deleted successfully`)
      
      if (activeProject?.id === projectToDelete.id) {
        setActiveProject(null)
      }
      
      // Call parent callback to refresh projects list
      if (onProjectDeleted) {
        onProjectDeleted()
      }
      
    } catch (error) {
      console.error('Error deleting project:', error)
      toast(`Failed to delete project "${projectToDelete.name}"`)
    } finally {
      setIsDeletingProject(false)
      setProjectToDelete(null)
    }
  }

  const handleDeleteClick = (project: {id: string, name: string}) => {
    setProjectToDelete(project)
    setShowProjectDeleteDialog(true)
  }

  return (
    <>
      <AddProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activeOrg={activeOrg}
      />

      <ConfirmAlertDialog
        open={showProjectDeleteDialog}
        onOpenChange={setShowProjectDeleteDialog}
        title="Delete Project"
        description={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone and will permanently remove all project data.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        onConfirm={handleDeleteProject}
        variant="destructive"
        icon={<Trash2 className="h-4 w-4" />}
        isLoading={isDeletingProject}
      />

      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          {projects.map((item, index) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                isActive={activeProject?.id === item.id}
                onClick={() => setActiveProject(item)}
              >
                <a href={'#'}>
                  <FolderClosed />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <Folder className="text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward className="text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteClick({id: item.id, name: item.name})
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="text-sidebar-foreground/70 gap-2 p-2"
              onClick={handleAddProject}
            >
              <Plus className="size-4" />
              Add Project
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}