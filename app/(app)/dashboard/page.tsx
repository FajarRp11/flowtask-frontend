"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-muted-foreground">
            Total Proyek
          </p>
          <p className="mt-2 text-3xl font-bold">12</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-muted-foreground">
            Tugas Selesai
          </p>
          <p className="mt-2 text-3xl font-bold">48</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-muted-foreground">
            Anggota Tim
          </p>
          <p className="mt-2 text-3xl font-bold">8</p>
        </div>
      </div>

      <div className="min-h-screen flex-1 rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Selamat datang kembali, {user?.name}!
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Anda telah berhasil masuk ke dalam sistem FlowTask. Gunakan sidebar di
          sebelah kiri untuk menavigasi menu aplikasi.
        </p>
      </div>
    </>
  );
}
