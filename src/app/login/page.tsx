import { AuthForm } from "@/components/AuthForm";
import { signIn } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">Welcome back</h1>
      <p className="mb-6 text-stone-500">Sign in to your family&apos;s timelines.</p>
      <AuthForm mode="login" action={signIn} next={next} />
    </div>
  );
}
