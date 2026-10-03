import { GuestGuard } from "@/features/auth/components/auth-guard";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <LoginForm />
      </main>
    </GuestGuard>
  );
}
