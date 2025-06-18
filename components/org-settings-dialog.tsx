"use client"

import { useState, useEffect } from "react"
import { Building2, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmAlertDialog } from "./confirm-alert-dialog";
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"

interface OrgSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: any
  projects: any[]
}

export function OrgSettingsDialog({
  open,
  onOpenChange,
  organization,
  projects,
}: OrgSettingsDialogProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  // Update form data when organization changes or when editing is enabled
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        description: organization.description || "",
      })
    }
  }, [organization, isEditing])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/v1/organizations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: organization.id,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update organization")
      }

      toast.success("Organization updated successfully")
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error("Failed to update organization")
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/organizations?orgId=${organization.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete organization")
      }

      toast.success("Organization deleted successfully")
      onOpenChange(false)
      router.push("/")
    } catch (error) {
      console.error("Error deleting organization:", error)
      toast.error("Failed to delete organization")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <p className="text-sm">{organization?.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <p className="text-sm">{organization?.description || "No description"}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <Label>Associated Projects</Label>
              <div className="flex-1 overflow-y-auto pr-2">
                {projects?.length > 0 ? (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-lg border p-3 text-sm"
                      >
                        <p className="font-medium">{project.name}</p>
                        <p className="text-muted-foreground">
                          {project.description || "No description"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No projects associated with this organization
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmAlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This action cannot be undone and will delete all associated projects."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
        icon={<Trash2 className="h-4 w-4" />}
        isLoading={isDeleting}
      />
    </>
  )
} 