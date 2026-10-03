import { GuestGuard } from "@/features/auth/components/auth-guard";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <GuestGuard>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <RegisterForm />
      </main>
    </GuestGuard>
  );
}
