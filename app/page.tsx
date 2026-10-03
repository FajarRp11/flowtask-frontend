"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Selamat datang di FlowTask
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Solusi manajemen tugas dan proyek modern untuk produktivitas tim Anda.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg">Buka Dashboard ({user?.name})</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
