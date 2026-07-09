"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Laptop, ShieldCheck } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginBackground from "@/components/assets/lapback.jpeg";

function FirebaseConfigAlert() {
  const { missingEnvVars, connection } = useAuth();

  if (missingEnvVars.length > 0) {
    return (
      <div
        className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-3 text-sm"
        role="alert"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="space-y-2">
            <p className="font-medium text-amber-950 dark:text-amber-100">
              Firebase environment variables are missing
            </p>
            <p className="text-amber-900/80 dark:text-amber-100/80">
              Add these to <code>.env.local</code> and restart the dev server:
            </p>
            <ul className="space-y-1 font-mono text-xs text-amber-950 dark:text-amber-100">
              {missingEnvVars.map((envVar) => (
                <li key={envVar}>- {envVar}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (connection?.error) {
    return (
      <div
        className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm text-destructive"
        role="alert"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Firebase failed to initialize</p>
            <p className="mt-1 text-destructive/90">{connection.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function LoginForm() {
  const { signIn, configured, connection } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSignIn =
    configured &&
    connection?.appInitialized &&
    connection.authConnected &&
    !connection.error;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Unable to sign in. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <Image
          src={loginBackground}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-sm space-y-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-[0_12px_32px_color-mix(in_oklch,var(--brand)_35%,transparent)]">
            <Laptop className="size-7" />
          </div>
          <div className="space-y-2">
            <Badge variant="outline" className="mx-auto gap-1.5 border-brand/25">
              <ShieldCheck className="size-3 text-brand" />
              Secure field tracker
            </Badge>
            <div>
              <h1 className="text-display text-3xl">LaptopScout</h1>
              <p className="text-subtitle mt-2">
                Sign in to manage visits, laptop finds, and buyer checklists.
              </p>
            </div>
          </div>
        </div>

        <Card className="surface-card border-border/60 bg-card/95 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access the shared scouting workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FirebaseConfigAlert />

            {canSignIn ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                {error ? (
                  <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full"
                  disabled={submitting}
                >
                  {submitting ? "Signing in" : "Sign in"}
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
