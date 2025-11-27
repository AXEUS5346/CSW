"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Shield } from "lucide-react"
import type { Admin } from "@/lib/types"

interface AdminsManagerProps {
  admins: Admin[]
  currentAdmin: Admin
}

export function AdminsManager({ admins, currentAdmin }: AdminsManagerProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (existingAdmin) {
      setError("This email is already an admin.")
      setIsLoading(false)
      return
    }

    // Create an admin entry (the user will need to sign up/login to use it)
    const { error: insertError } = await supabase.from("admins").insert({
      email: email.toLowerCase(),
      user_id: crypto.randomUUID(), // Placeholder, will be updated when user signs up
      invited_by: currentAdmin.id,
      is_super_admin: false,
    })

    if (insertError) {
      setError("Failed to invite admin. Please try again.")
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    setIsDialogOpen(false)
    setEmail("")
    router.refresh()
  }

  const handleDelete = async (adminId: string) => {
    if (adminId === currentAdmin.id) {
      alert("You cannot remove yourself.")
      return
    }

    if (!confirm("Are you sure you want to remove this admin?")) return

    const supabase = createClient()
    await supabase.from("admins").delete().eq("id", adminId)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Admins</CardTitle>
            <CardDescription>Manage admin access. Only admins can invite new admins.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Invite Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Admin</DialogTitle>
                <DialogDescription>
                  Enter the email address of the person you want to invite as an admin.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Inviting..." : "Send Invite"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">
                  {admin.email}
                  {admin.id === currentAdmin.id && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
                </TableCell>
                <TableCell>
                  {admin.is_super_admin ? (
                    <Badge className="gap-1">
                      <Shield className="h-3 w-3" /> Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Admin</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {admin.invited_by ? admins.find((a) => a.id === admin.invited_by)?.email || "Unknown" : "-"}
                </TableCell>
                <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  {admin.id !== currentAdmin.id && !admin.is_super_admin && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(admin.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
