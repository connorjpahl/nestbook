import { AuthForm } from "@/components/AuthForm";
import { signUp } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">Create your account</h1>
      <p className="mb-6 text-stone-500">
        Start a timeline for your child in a couple of minutes.
      </p>
      <AuthForm mode="signup" action={signUp} />
    </div>
  );
}
