import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// Called by the customer's job detail page to create/retrieve the PaymentIntent
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: { driver: { include: { driverProfile: true } } },
  });

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.customerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (job.status !== "ACCEPTED") return NextResponse.json({ error: "Job is not in accepted state" }, { status: 409 });

  // Return existing PaymentIntent if already created
  if (job.stripePaymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(job.stripePaymentIntentId);
    if (existing.status !== "canceled") {
      return NextResponse.json({ clientSecret: existing.client_secret });
    }
  }

  const amountCents = Math.round(job.offeredPrice * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    metadata: {
      jobId: job.id,
      customerId: job.customerId,
      driverId: job.driverId ?? "",
    },
    description: `Haul job: ${job.title}`,
  });

  await db.job.update({
    where: { id: jobId },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
