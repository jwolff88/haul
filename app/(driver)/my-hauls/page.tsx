import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Navbar from "@/components/shared/Navbar";
import JobCard from "@/components/jobs/JobCard";
import type { JobWithRelations } from "@/types";

export const metadata = { title: "My Hauls — Haul" };

export default async function MyHaulsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const jobs = await db.job.findMany({
    where: { driverId: userId },
    include: {
      customer: { select: { id: true, name: true, avatarUrl: true } },
      driver: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { acceptedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="driver" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">My Hauls</h1>

        {jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛻</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hauls yet</h3>
            <p className="text-gray-500">Browse open jobs and accept your first haul.</p>
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
