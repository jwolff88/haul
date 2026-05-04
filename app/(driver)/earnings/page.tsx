import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Navbar from "@/components/shared/Navbar";
import ConnectOnboard from "@/components/driver/ConnectOnboard";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, CheckCircle } from "lucide-react";

export const metadata = { title: "Earnings — Haul" };

export default async function EarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ connect?: string; error?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { connect } = await searchParams;

  const profile = await db.driverProfile.findUnique({ where: { userId } });

  const completedJobs = await db.job.findMany({
    where: { driverId: userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  const totalEarned = completedJobs.reduce((sum, j) => sum + (j.driverPayout ?? 0), 0);
  const totalJobs = completedJobs.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="driver" />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Earnings</h1>

        {/* Connect status banner */}
        {connect === "connected" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">Stripe connected! You&apos;re ready to receive payouts.</span>
          </div>
        )}
        {connect === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
            Your Stripe account is still being verified. You can continue accepting jobs — payouts will be sent once verification is complete.
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <DollarSign className="w-4 h-4" /> Total earned
              </div>
              <div className="text-3xl font-black text-gray-900">${totalEarned.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4" /> Hauls completed
              </div>
              <div className="text-3xl font-black text-gray-900">{totalJobs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stripe Connect onboarding */}
        <ConnectOnboard profile={profile} />

        {/* Payout history */}
        {completedJobs.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 mb-3">Recent payouts</h2>
            <div className="space-y-2">
              {completedJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{job.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {job.completedAt
                          ? new Date(job.completedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}
                      </div>
                    </div>
                    <div className="font-bold text-green-600">
                      +${(job.driverPayout ?? 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
