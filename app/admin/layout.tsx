import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/sidebar";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect(
      session?.user
        ? "/"
        : "/connexion?callbackUrl=/admin"
    );
  }

  return (
    <div className="min-h-screen bg-paper-soft">
      <AdminSidebar
        name={session.user.name ?? "Administrateur"}
        email={session.user.email ?? "admin@descomall.cm"}
      />
      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-30 hidden h-14 items-center justify-between border-b border-ink-line bg-white px-8 lg:flex">
          <p className="text-[11.5px] text-ink-muted">
            Administration DESCO MALL · {formatDate(new Date())}
          </p>
          <div className="flex items-center gap-4">
            <span className="rounded-sm bg-paper-soft px-2 py-1 text-[10.5px] text-ink-muted">
              Environnement de démonstration
            </span>
            <Link
              href="/"
              className="text-[11.5px] font-medium text-brand-black underline-offset-4 hover:underline"
            >
              Voir la boutique
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 md:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
