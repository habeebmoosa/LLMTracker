"use client"

import { useState } from "react"
import {
  BadgeCheck,
  ChevronsUpDown,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { ConfirmAlertDialog } from "./confirm-alert-dialog"
import { OrgSettingsDialog } from "./org-settings-dialog"
import { signOut as nextAuthSignOut } from "next-auth/react";
import { toast } from "sonner";

interface NavUserProps {
  user: any
  projects: any
  activeOrg: any
}

// Utility to get initials from a name
function getInitials(name?: string) {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0]?.toUpperCase() || "?";
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function NavUser({
  user,
  projects,
  activeOrg
}: NavUserProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const signOut = async () => {
    setIsLoggingOut(true)
    try {
      await nextAuthSignOut({ redirect: false });
      toast("Signed out successfully")
    } catch (error) {
      console.error('Error signing out:', error)
      toast("Error signing out")
    } finally {
      setIsLoggingOut(false)
      router.push("/")
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  if (!user) return null;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                  )}
                  
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {/* <span className="truncate font-medium">{user.name}</span> */}
                    {/* <span className="truncate text-xs">{user.email}</span> */}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Sparkles />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                  <Settings />
                  Organization Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutClick}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <ConfirmAlertDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Confirm Logout"
        description="Are you sure you want to log out? You will need to sign in again to access your account."
        confirmText="Log out"
        cancelText="Cancel"
        onConfirm={signOut}
        variant="destructive"
        icon={<LogOut className="h-4 w-4" />}
        isLoading={isLoggingOut}
      />

      <OrgSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        organization={activeOrg}
        projects={projects}
      />
    </>
  )
}