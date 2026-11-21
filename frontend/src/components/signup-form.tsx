"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth, UserRole } from "@/context/auth-context"
import { ShieldCheckIcon, UserIcon, LandmarkIcon } from "lucide-react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const { login } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole>("organizer")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      login(email, selectedRole, name)
      setIsLoading(false)
      router.push("/dashboard")
    }, 400)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center mb-1">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 mb-1">
            <LandmarkIcon className="size-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Create an Account
          </h1>
          <p className="text-xs text-balance text-muted-foreground">
            Register your Chit Fund profile as an organizer or subscriber
          </p>
        </div>

        {/* 2 User Roles Selector */}
        <div className="space-y-1.5">
          <FieldLabel className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Account Type / Role
          </FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole("organizer")}
              className={`flex flex-col items-center p-2.5 rounded-lg border text-xs transition-all ${
                selectedRole === "organizer"
                  ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/50 dark:text-indigo-200 font-semibold ring-1 ring-indigo-600 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <ShieldCheckIcon className="size-4 mb-1 text-indigo-600" />
              <span>Chit Organizer</span>
              <span className="text-[10px] text-muted-foreground font-normal">Host & manage funds</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("subscriber")}
              className={`flex flex-col items-center p-2.5 rounded-lg border text-xs transition-all ${
                selectedRole === "subscriber"
                  ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-200 font-semibold ring-1 ring-emerald-600 shadow-xs"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <UserIcon className="size-4 mb-1 text-emerald-600" />
              <span>Chit Subscriber</span>
              <span className="text-[10px] text-muted-foreground font-normal">Bid & invest</span>
            </button>
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="ramesh@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            {isLoading ? "Creating account..." : `Register as ${selectedRole === "organizer" ? "Organizer" : "Subscriber"}`}
          </Button>
        </Field>

        <div className="flex justify-center text-xs">
          <FieldDescription className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </FieldDescription>
        </div>
      </FieldGroup>
    </form>
  )
}
