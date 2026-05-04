import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import JobForm from "@/components/jobs/JobForm";

export const metadata = { title: "Post a Haul Job — Haul" };

export default async function PostJobPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Post a Haul Job</h1>
          <p className="text-gray-600 mt-1">Describe what you need moved and set your price. Drivers will see it instantly.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <JobForm />
        </div>
      </main>
    </div>
  );
}
