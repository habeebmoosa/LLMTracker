"use client"

import * as React from "react"
import { ChevronsUpDown, Command, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { AddOrganizationDialog } from "@/components/add-organization-dialog"

export function TeamSwitcher({
  organizations,
}: {
  organizations: {
    id: string
    name: string
    description: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  
  // console.log("Organizations:", organizations)
  // console.log("Organizations length:", organizations?.length)
  
  type Team = {
    id: string
    name: string
    description: string
  }
  
  const [activeTeam, setActiveTeam] = React.useState<Team | null>(null)

  React.useEffect(() => {
    if (organizations && organizations.length > 0) {
      // console.log("Setting active team to:", organizations[0])
      setActiveTeam(organizations[0])
    }
  }, [organizations])

  // console.log("Active Team:", activeTeam)

  const handleAddOrganization = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDialogOpen(true)
  }

  if (!activeTeam) {
    console.log("Returning null because activeTeam is:", activeTeam)
    return (
      <>
        <AddOrganizationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={handleAddOrganization}
              className="justify-start"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Organization
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </>
    )
  }

  return (
    <>
      <AddOrganizationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{activeTeam.name}</span>
                  <span className="truncate text-xs">{activeTeam.description}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Command className="size-4" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleAddOrganization}
                className="gap-2 p-2"
              >
                <Plus className="size-4" />
                Add Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}