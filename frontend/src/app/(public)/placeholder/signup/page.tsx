import { SignupForm } from "@/components/forms/users/signup-form";

export default async function Signup() {
  return (
    <div className="w-full max-w-sm flex flex-col gap-6 mx-auto mt-20 ">
      <h1 className="flex self-center text-5xl font-extrabold tracking-tight text-balance">
        Stocked - Signup
      </h1>
      <SignupForm />
    </div>
  );
}