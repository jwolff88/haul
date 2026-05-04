import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/shared/Navbar";
import JobCard from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { JobWithRelations } from "@/types";

export const metadata = { title: "My Jobs — Haul" };

export default async function MyJobsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const jobs = await db.job.findMany({
    where: { customerId: userId },
    include: {
      customer: { select: { id: true, name: true, avatarUrl: true } },
      driver: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">My Jobs</h1>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" render={<Link href="/post-job" />}>
            <Plus className="w-4 h-4 mr-1" /> New Job
          </Button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛻</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-500 mb-6">Post your first haul job and get someone to move your stuff today.</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" render={<Link href="/post-job" />}>
              Post a Job
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job as unknown as JobWithRelations} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
