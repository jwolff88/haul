export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: ReturnType<typeof stripe.webhooks.constructEvent> extends Promise<infer T> ? T : ReturnType<typeof stripe.webhooks.constructEvent>;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const jobId = pi.metadata?.jobId;
      if (!jobId) break;

      await db.job.updateMany({
        where: { id: jobId, stripePaymentIntentId: pi.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      const jobId = pi.metadata?.jobId;
      if (!jobId) break;

      // Reset job back to ACCEPTED so customer can retry payment
      await db.job.updateMany({
        where: { id: jobId, stripePaymentIntentId: pi.id },
        data: { stripePaymentIntentId: null },
      });
      break;
    }

    case "account.updated": {
      const account = event.data.object;
      if (account.charges_enabled && account.payouts_enabled) {
        await db.driverProfile.updateMany({
          where: { stripeAccountId: account.id },
          data: { isVerified: true },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
