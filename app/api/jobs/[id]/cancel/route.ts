import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await db.job.findUnique({ where: { id } });

  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.customerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["OPEN", "ACCEPTED"].includes(job.status)) {
    return NextResponse.json({ error: "Cannot cancel a job that is in progress or completed" }, { status: 409 });
  }

  // Cancel pending PaymentIntent if it exists
  if (job.stripePaymentIntentId) {
    try {
      await stripe.paymentIntents.cancel(job.stripePaymentIntentId);
    } catch {
      // Already cancelled or captured — ignore
    }
  }

  const cancelled = await db.job.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(cancelled);
}
