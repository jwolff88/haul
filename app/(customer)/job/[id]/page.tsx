import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import Navbar from "@/components/shared/Navbar";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import JobActions from "@/components/jobs/JobActions";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Package, DollarSign, User, ChevronLeft } from "lucide-react";
import { JOB_SIZE_LABELS } from "@/types";
import { formatDistanceToNow, format } from "date-fns";

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const { payment } = await searchParams;

  const job = await db.job.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, avatarUrl: true } },
      driver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          driverProfile: { select: { vehicleType: true, isVerified: true, stripeAccountId: true } },
        },
      },
    },
  });

  if (!job) notFound();

  const isCustomer = job.customerId === userId;
  const isDriver = job.driverId === userId;

  if (!isCustomer && !isDriver) redirect("/my-jobs");

  const platformFee = job.platformFee ?? 0;
  const driverPayout = job.driverPayout ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Link
          href={isDriver ? "/my-hauls" : "/my-jobs"}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          {isDriver ? "Back to My Hauls" : "Back to My Jobs"}
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-xl font-black text-gray-900 leading-snug">{job.title}</h1>
              <JobStatusBadge status={job.status} />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
            <div className="mt-3 text-xs text-gray-400 flex items-center gap-3">
              <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              {job.scheduledFor && (
                <span>· Scheduled {format(new Date(job.scheduledFor), "MMM d 'at' h:mm a")}</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardContent className="p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-gray-500">
              <MapPin className="w-4 h-4" /> Route
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Pickup</div>
                  <div className="font-medium text-gray-900">{job.pickupAddress}</div>
                </div>
              </div>
              <div className="ml-3 border-l-2 border-dashed border-gray-200 h-3" />
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Dropoff</div>
                  <div className="font-medium text-gray-900">{job.dropoffAddress}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details + Pricing */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-gray-900">{JOB_SIZE_LABELS[job.size]}</span>
            </div>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Offered price</span>
                <span className="font-bold text-gray-900">${job.offeredPrice.toFixed(2)}</span>
              </div>
              {isCustomer && (
                <>
                  <div className="flex justify-between text-gray-500">
                    <span>Platform fee (15%)</span>
                    <span>−${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver earns</span>
                    <span className="font-bold text-green-600">${driverPayout.toFixed(2)}</span>
                  </div>
                </>
              )}
              {isDriver && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Your payout</span>
                  <span className="font-bold text-green-600">${driverPayout.toFixed(2)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Driver info card (shown to customer) */}
        {job.driver && isCustomer && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-orange-500" />
                <span className="font-bold text-gray-900 text-sm">Your Driver</span>
              </div>
              <div className="flex items-center gap-3">
                {job.driver.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.driver.avatarUrl}
                    alt={job.driver.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                    {job.driver.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-900">{job.driver.name}</div>
                  {job.driver.driverProfile?.vehicleType && (
                    <div className="text-sm text-gray-500">{job.driver.driverProfile.vehicleType}</div>
                  )}
                  {job.acceptedAt && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      Accepted {formatDistanceToNow(new Date(job.acceptedAt), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer info card (shown to driver) */}
        {isDriver && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-gray-900 text-sm">Customer</span>
              </div>
              <div className="flex items-center gap-3">
                {job.customer.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.customer.avatarUrl}
                    alt={job.customer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                    {job.customer.name[0]}
                  </div>
                )}
                <div className="font-bold text-gray-900">{job.customer.name}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions — payment form, complete button, cancel */}
        <JobActions
          job={{
            id: job.id,
            status: job.status,
            offeredPrice: job.offeredPrice,
            stripePaymentIntentId: job.stripePaymentIntentId,
            driverId: job.driverId,
            driver: job.driver ? { driverProfile: job.driver.driverProfile } : null,
          }}
          isCustomer={isCustomer}
          isDriver={isDriver}
          paymentJustSucceeded={payment === "success"}
        />
      </main>
    </div>
  );
}
