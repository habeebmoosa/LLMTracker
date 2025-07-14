'use client'

import { AppSidebar } from "@/components/app-sidebar"
import LLMUsageDashboard from "@/components/project-dashboard"
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
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Project {
  id: string;
  apiKey: string;
  [key: string]: any;
}

export default function  Page() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeOrg, setActiveOrg] = useState<any>();
  const [activeProject, setActiveProject] = useState<Project | undefined>();
  const [user, setUser] = useState<any>(null);
  const { data: session, status } = useSession();

  const fetchOrgs = async (userId: string) => {
    const orgData = await fetch(`/api/v1/organizations?userId=${userId}`);
    const data = await orgData.json();
    setOrganizations(data.data || []);
  }

  const fetchProjects = async (userId: string, orgId: string) => {
    const projectsData = await fetch(`/api/v1/projects?orgId=${orgId}&userId=${userId}`);
    const data = await projectsData.json();
    console.log("it's project data", data)
    setProjects(data.data || []);
  }

  const onProjectDeleted = () => {
    if (user && activeOrg) fetchProjects(user.id, activeOrg.id);
  };

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
      fetchOrgs(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (organizations && organizations.length > 0) {
      setActiveOrg(organizations[0])
    }
  }, [organizations])

  useEffect(() => {
    if (activeOrg && user) {
      fetchProjects(user.id, activeOrg.id);
    }
  }, [activeOrg, user])

  useEffect(() => {
    if (projects && projects.length > 0) {
      setActiveProject(projects[0])
    }
  }, [projects])

  return (
    <SidebarProvider>
      <AppSidebar
        organizations={organizations}
        projects={projects}
        activeOrg={activeOrg}
        setActiveOrg={setActiveOrg}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
        userData={user}
        onProjectDeleted={onProjectDeleted}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <LLMUsageDashboard project={activeProject} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
