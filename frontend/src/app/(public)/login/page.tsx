import { LoginForm } from "@/components/forms/users/login-form";
import { Suspense } from "react";

export default async function Login() {
  return (
    <div className="w-full max-w-sm flex flex-col gap-6 mx-auto mt-20 ">
      <h1 className="flex self-center text-5xl font-extrabold tracking-tight text-balance">
        Stocked
      </h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
