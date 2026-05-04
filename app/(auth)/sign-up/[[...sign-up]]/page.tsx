import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl font-black text-orange-500 tracking-tight">HAUL</span>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
