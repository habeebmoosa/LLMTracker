'use client'

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react";

interface Organization {
  id: string
  name: string
  description: string
}

export default function Page() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeOrg, setActiveOrg] = useState<any>();
  const [activeProject, setActiveProject] = useState();

  const supabase = createClient();

  const fetchOrgs = async () => {
    const userData = await supabase.auth.getUser();
    const user = userData.data.user;

    console.log(userData)
    const orgData = await fetch(`/api/v1/organizations?userId=${user?.id}`);
    const data = await orgData.json();
    console.log("Here the log of LLM Tracker");
    console.log(data.data)

    setOrganizations(data.data)
  }

  const fetchProjects = async () => {
    const userData = await supabase.auth.getUser();
    const user = userData.data.user;

    const projectsData = await fetch(`/api/v1/projects?orgId=${activeOrg?.id}&userId=${user?.id}`);
    const data = await projectsData.json();
    console.log("projects logs")
    setProjects(data.data);
    console.log(data.data)
  }

  useEffect(() => {
    if (organizations && organizations.length > 0) {
      setActiveOrg(organizations[0])
    }
  }, [organizations])

  useEffect(() => {
    if (activeOrg) {
      fetchProjects();
    }
  }, [activeOrg])

  useEffect(() => {
    if (projects && projects.length > 0) {
      setActiveProject(projects[0])
    }
  }, [projects])

  useEffect(() => {
    fetchOrgs();
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar
        organizations={organizations}
        projects={projects}
        activeOrg={activeOrg}
        setActiveOrg={setActiveOrg}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
