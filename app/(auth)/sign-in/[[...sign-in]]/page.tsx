import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl font-black text-orange-500 tracking-tight">HAUL</span>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
