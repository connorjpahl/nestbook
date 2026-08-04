import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <span aria-hidden className="text-xl">🧸</span>
          Little Timeline
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-stone-600 hover:text-stone-900">
              Dashboard
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-stone-700 transition hover:bg-stone-100"
              >
                Sign out
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-stone-600 hover:text-stone-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-600 px-3 py-1.5 font-medium text-white transition hover:bg-amber-700"
            >
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
