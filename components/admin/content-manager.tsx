"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"
import type { Content } from "@/lib/types"

interface ContentManagerProps {
  content: Content[]
  adminId: string
}

export function ContentManager({ content, adminId }: ContentManagerProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  const openEditDialog = (item: Content) => {
    setEditingContent(item)
    setFormData({
      title: item.title || "",
      content: item.content || "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContent) return

    setIsLoading(true)

    const supabase = createClient()

    await supabase
      .from("content")
      .update({
        title: formData.title || null,
        content: formData.content || null,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingContent.id)

    setIsLoading(false)
    setIsDialogOpen(false)
    setEditingContent(null)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>Edit the content displayed on different pages of the website.</CardDescription>
      </CardHeader>
      <CardContent>
        {content.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No content items found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.page}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{item.section}</TableCell>
                  <TableCell className="font-medium">{item.title || "-"}</TableCell>
                  <TableCell>{new Date(item.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
              <DialogDescription>
                Update the content for {editingContent?.page} - {editingContent?.section}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
