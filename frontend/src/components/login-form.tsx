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
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth, UserRole } from "@/context/auth-context"
import { api } from "@/lib/api"
import { CoinsIcon, AlertCircleIcon, DatabaseIcon } from "lucide-react"
import { SvglGoogle, SvglGithub, SvglApple } from "@/components/ui/svgl-icons"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState("admin@orgmenu.com")
  const [password, setPassword] = useState("admin")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Authenticate user strictly against the database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting login for:", email, "with pwd:", password)
    setIsLoading(true)
    setError(null)

    try {
      // Calls FastAPI /api/v1/auth/login -> verifies against database table 'users'
      const res = await api.login({ email: email.trim(), password })
      login(res.user.email, res.user.role as UserRole, res.user.name)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to authenticate against database.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-5", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1.5 text-center mb-1">
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 mb-1">
            <CoinsIcon className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sign in to ChitStream
          </h1>
          <p className="text-xs text-balance text-muted-foreground flex items-center justify-center gap-1">
            <DatabaseIcon className="size-3 text-indigo-500" />
            Enter your credentials to access your account
          </p>
        </div>

        {/* Database Error Banner */}
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900 flex items-start gap-2 shadow-xs">
            <AlertCircleIcon className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Failed</p>
              <p className="text-[11px] opacity-90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Role Fill Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@orgmenu.com")
              setPassword("admin")
            }}
            className={cn(
              "flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all",
              email === "admin@orgmenu.com"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            OrgMenu Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("user@chits.com")
              setPassword("user")
            }}
            className={cn(
              "flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all",
              email === "user@chits.com"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Chits Member
          </button>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-xs text-indigo-600 hover:underline underline-offset-4"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm font-semibold transition-all"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </Field>

        {/* SVGL Social Auth Options */}
        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white dark:bg-slate-950 px-2 text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              login("subscriber@gmail.com", "chits", "Google Subscriber");
              window.location.href = "/dashboard";
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-xs font-semibold"
          >
            <SvglGoogle size={15} />
            <span className="text-[11px]">Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              login("developer@github.com", "orgmenu", "GitHub Admin");
              window.location.href = "/dashboard";
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-xs font-semibold text-slate-900 dark:text-slate-100"
          >
            <SvglGithub size={15} />
            <span className="text-[11px]">GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => {
              login("apple.user@icloud.com", "chits", "Apple Member");
              window.location.href = "/dashboard";
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-xs font-semibold text-slate-900 dark:text-slate-100"
          >
            <SvglApple size={15} />
            <span className="text-[11px]">Apple</span>
          </button>
        </div>

        <div className="flex justify-center text-xs pt-1">
          <FieldDescription className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-indigo-600 hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </FieldDescription>
        </div>
      </FieldGroup>
    </form>
  )
}
