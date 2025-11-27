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
    linkedin_url: "",
    twitter_url: "",
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
      linkedin_url: formData.linkedin_url || null,
      twitter_url: formData.twitter_url || null,
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
              Join our community of developers building across the stack.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Benefits Section */}
            <div>
              <h2 className="text-xl font-bold mb-6">Why Join CrossStack?</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Event Access</h3>
                    <p className="text-sm text-muted-foreground">Be the first to know about and register for events.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Network</h3>
                    <p className="text-sm text-muted-foreground">Connect with developers and industry professionals.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">Learn & Build</h3>
                    <p className="text-sm text-muted-foreground">
                      Access workshops, code reviews, and build projects together.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
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
                      placeholder="Tell us about yourself..."
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

                  <div className="grid gap-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="twitter">Twitter URL</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={formData.twitter_url}
                      onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                      placeholder="https://twitter.com/username"
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
