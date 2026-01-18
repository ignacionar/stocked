"use client"

import React, { useTransition, useState, useEffect } from "react"
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
import Image from "next/image"
import { signIn } from "@/lib/auth-client"
import { useSearchParams, useRouter } from "next/navigation"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleInputChange = () => {
    if (errorMessage) setErrorMessage(null)
  }

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "user_not_found") {
      setTimeout(() => {
        setErrorMessage("Usuario no encontrado con Google.");
      }, 100); 
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  }, [searchParams]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    const res = await signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      fetchOptions: {
        onSuccess: () => router.push("/-"),
      }
    });

    if (res.error?.code === "INVALID_EMAIL_OR_PASSWORD") {
      return setErrorMessage("Nombre de usuario o contraseña incorrectos.");
    } 

    if (res.error) {
      return setErrorMessage("La conexión falló. Contacte al soporte.");
    }
  }

  const handleSocialLogin = async () => {
    const res = await signIn.social({
      provider: "google",
      errorCallbackURL: "/login?error=user_not_found",
      fetchOptions: {
        onSuccess: () => router.push("/-"),
      },
      callbackURL: "/-"
    });

    if (res.error) {
      setErrorMessage("La conexión falló. Contacte al soporte.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder a su cuenta.
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
                <Button type="submit" className="w-full cursor-pointer" disabled={isPending}>
                  {isPending ? "Ingresando..." : "Iniciar Sesión"}
                </Button>
                {!isPending && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={() => {
                      handleSocialLogin();
                      setLoading(true);
                    }}
                    disabled={loading}
                  >
                    <Image
                      src="/googlelogo.svg"
                      alt="Google icon"
                      width={20}
                      height={20}
                    />
                    Iniciar sesión con Google
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}