export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// Customer calls this to confirm the job is done — triggers driver payout
export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    include: { driver: { include: { driverProfile: true } } },
  });

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.customerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Job must be in progress to complete" }, { status: 409 });
  }

  const driverProfile = job.driver?.driverProfile;
  if (!driverProfile?.stripeAccountId) {
    return NextResponse.json({ error: "Driver has not connected Stripe" }, { status: 400 });
  }

  if (!job.stripePaymentIntentId) {
    return NextResponse.json({ error: "No payment found for this job" }, { status: 400 });
  }

  const payoutCents = Math.round((job.driverPayout ?? 0) * 100);

  const transfer = await stripe.transfers.create({
    amount: payoutCents,
    currency: "usd",
    destination: driverProfile.stripeAccountId,
    metadata: { jobId: job.id },
    description: `Haul payout: ${job.title}`,
  });

  const completedJob = await db.job.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      stripeTransferId: transfer.id,
    },
  });

  return NextResponse.json(completedJob);
}
