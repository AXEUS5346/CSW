"use client"

import type React from "react"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Calendar, Users, Code } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function JoinPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    github_url: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    const { error: insertError } = await supabase.from("members").insert({
      name: formData.name,
      email: formData.email,
      bio: formData.bio || null,
      github_url: formData.github_url || null,
    })

    if (insertError) {
      if (insertError.code === "23505") {
        setError("This email is already registered as a member.")
      } else {
        setError("Something went wrong. Please try again.")
      }
      setIsSubmitting(false)
      return
    }

    setIsSuccess(true)
    setIsSubmitting(false)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-16 px-6">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-primary">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to CrossStack!</CardTitle>
              <CardDescription>Your membership request has been submitted successfully.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You are now part of the community. Stay tuned for upcoming events and updates!
              </p>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="border-b border-border bg-secondary py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Become a Member</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Join our community of builders, founders, and tinkerers.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold mb-6">Why Join CrossStack?</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Demo Your Projects</h3>
                    <p className="text-sm text-muted-foreground">
                      Present real projects and get actionable feedback from other builders.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Connect with Builders</h3>
                    <p className="text-sm text-muted-foreground">
                      Network with founders, developers, and tinkerers who ship.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Learn by Building</h3>
                    <p className="text-sm text-muted-foreground">
                      Structured but lightweight events focused on practical learning.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Join Us</CardTitle>
                <CardDescription>Fill out the form below to become a member. It is free!</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself and what you're building..."
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                      id="github"
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Become a Member"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
