import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/shared/Navbar";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Package, DollarSign, Clock, User, ChevronLeft } from "lucide-react";
import { JOB_SIZE_LABELS } from "@/types";
import { formatDistanceToNow, format } from "date-fns";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, avatarUrl: true } },
      driver: { select: { id: true, name: true, avatarUrl: true, driverProfile: true } },
      ratings: true,
    },
  });

  if (!job) notFound();

  const isCustomer = job.customerId === userId;
  const isDriver = job.driverId === userId;

  if (!isCustomer && !isDriver) {
    return redirect("/my-jobs");
  }

  const platformFee = job.platformFee ?? 0;
  const driverPayout = job.driverPayout ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/my-jobs" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to My Jobs
        </Link>

        <div className="space-y-4">
          {/* Header */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-xl font-black text-gray-900">{job.title}</h1>
                <JobStatusBadge status={job.status} />
              </div>
              <p className="text-gray-600">{job.description}</p>

              <div className="mt-4 text-xs text-gray-400">
                Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                {job.scheduledFor && (
                  <> · Scheduled for {format(new Date(job.scheduledFor), "MMM d, h:mm a")}</>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Locations
              </h2>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Pickup</div>
                    <div className="text-gray-900 font-medium">{job.pickupAddress}</div>
                  </div>
                </div>
                <div className="ml-2.5 border-l-2 border-dashed border-gray-200 h-4" />
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Dropoff</div>
                    <div className="text-gray-900 font-medium">{job.dropoffAddress}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job details */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" /> Job Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Load Size</div>
                  <div className="font-medium text-gray-900">{JOB_SIZE_LABELS[job.size]}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</div>
                  <div className="font-medium text-gray-900">{job.status}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" /> Payment
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Offered price</span>
                  <span className="font-bold text-gray-900">${job.offeredPrice.toFixed(2)}</span>
                </div>
                {isCustomer && (
                  <>
                    <div className="flex justify-between text-gray-500">
                      <span>Platform fee (15%)</span>
                      <span>−${platformFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Driver earns</span>
                      <span className="font-bold text-green-600">${driverPayout.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Driver info (shown to customer once accepted) */}
          {job.driver && isCustomer && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-5">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" /> Your Driver
                </h2>
                <div className="flex items-center gap-3">
                  {job.driver.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.driver.avatarUrl}
                      alt={job.driver.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-bold text-gray-900">{job.driver.name}</div>
                    {job.acceptedAt && (
                      <div className="text-sm text-gray-500">
                        Accepted {formatDistanceToNow(new Date(job.acceptedAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {isCustomer && job.status === "OPEN" && (
            <form action={`/api/jobs/${job.id}/cancel`} method="POST">
              <Button
                type="submit"
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                Cancel Job
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
