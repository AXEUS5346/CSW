"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import type { Member } from "@/lib/types"

interface MembersManagerProps {
  members: Member[]
}

export function MembersManager({ members }: MembersManagerProps) {
  const router = useRouter()

  const handleDelete = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    const supabase = createClient()
    await supabase.from("members").delete().eq("id", memberId)
    router.refresh()
  }

  const toggleApproval = async (member: Member) => {
    const supabase = createClient()
    await supabase.from("members").update({ is_approved: !member.is_approved }).eq("id", member.id)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>View and manage community members.</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No members yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name || "-"}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {member.github_url && (
                        <a
                          href={member.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                      {member.linkedin_url && (
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.is_approved ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleApproval(member)}
                    >
                      {member.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
