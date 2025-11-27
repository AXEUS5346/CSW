"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DESIGNATED_ADMIN_EMAILS } from "@/lib/types"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSetupPassword, setShowSetupPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  const isDesignatedAdmin = DESIGNATED_ADMIN_EMAILS.includes(email.toLowerCase())

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: newPassword,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin`,
      },
    })

    if (signUpError) {
      if (signUpError.message.includes("already registered")) {
        setShowSetupPassword(false)
        setError("An account already exists. Please enter your password to login.")
      } else {
        setError(signUpError.message)
      }
      setIsLoading(false)
      return
    }

    if (signUpData.user) {
      router.push("/auth/sign-up-success")
    }

    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        if (isDesignatedAdmin) {
          const { data: existingAdmin } = await supabase
            .from("admins")
            .select("id")
            .eq("user_id", data.user.id)
            .single()

          if (!existingAdmin) {
            await supabase.from("admins").insert({
              user_id: data.user.id,
              email: email.toLowerCase(),
              is_super_admin: true,
            })
          }
          router.push("/admin")
        } else {
          const { data: admin } = await supabase.from("admins").select("id").eq("user_id", data.user.id).single()

          if (admin) {
            router.push("/admin")
          } else {
            router.push("/")
          }
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (showSetupPassword && isDesignatedAdmin) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-secondary">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex justify-center">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/crossstack-logo.png"
                  alt="CrossStack"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <span className="text-xl font-bold">CrossStack</span>
              </Link>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Setup Admin Account</CardTitle>
                <CardDescription>
                  Welcome! As a designated admin, create a password to set up your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSetupPassword}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} disabled />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create a password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Setting up..." : "Create Admin Account"}
                    </Button>
                  </div>
                </form>
                <Button variant="ghost" className="w-full mt-4" onClick={() => setShowSetupPassword(false)}>
                  Back to login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-secondary">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/crossstack-logo.png"
                alt="CrossStack"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold">CrossStack</span>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {isDesignatedAdmin && (
                    <p className="text-sm text-muted-foreground">
                      Designated admin detected. First time?{" "}
                      <button
                        type="button"
                        className="text-primary underline font-medium"
                        onClick={() => setShowSetupPassword(true)}
                      >
                        Set up your password
                      </button>
                    </p>
                  )}
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  <Link href="/" className="underline underline-offset-4">
                    Back to home
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
