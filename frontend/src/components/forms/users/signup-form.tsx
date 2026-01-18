"use client"

import React, { useTransition, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/auth-client"

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleInputChange = () => {
    if (errorMessage) setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    await signUp.email({
      name: "Ignacio Narvaja",
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      occupation: "Ocupacion",
      role: "OWNER",
      plan: "BASIC",
      callbackURL: "/-",
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
        <CardHeader>
          <CardTitle>Crear Usuario</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para crear una cuenta nueva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && <div className="mb-4 text-sm text-red-500">{errorMessage}</div>}
          
          <form
            onSubmit={(e) => startTransition(() => handleSubmit(e))}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nombre@dominio.com"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="contraseña"
                  required
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Ingresando..." : "Crear usuario"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}