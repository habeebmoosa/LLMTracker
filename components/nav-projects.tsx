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
}

export function NavProjects({
  projects,
  activeProject,
  setActiveProject,
  activeOrg
}: NavProjectsProps) {
  const { isMobile } = useSidebar();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!projects || !Array.isArray(projects)) {
    return null;
  }

  const handleAddProject = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDialogOpen(true)
  }

  return (
    <>
    <AddProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} activeOrg={activeOrg} />
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item, index) => (
          <SidebarMenuItem key={item.name}>
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
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70 gap-2 p-2"
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
