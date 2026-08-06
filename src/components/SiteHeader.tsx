import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { SproutMark } from "@/components/SproutMark";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-terracotta-100 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-stone-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-terracotta-100">
            <SproutMark className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">NestBook</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-stone-600 hover:text-terracotta-700">
              Dashboard
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-stone-700 transition hover:bg-white"
              >
                Sign out
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-stone-600 hover:text-terracotta-700">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-terracotta-600 px-3 py-1.5 font-medium text-white transition hover:bg-terracotta-700"
            >
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
