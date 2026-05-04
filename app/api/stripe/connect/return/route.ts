export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// Stripe redirects here after Express onboarding completes
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/earnings?error=missing_account`);
  }

  const account = await stripe.accounts.retrieve(accountId);
  const ready = account.charges_enabled && account.payouts_enabled;

  if (ready) {
    // Find the driver profile by Stripe account ID and mark verified
    await db.driverProfile.updateMany({
      where: { stripeAccountId: accountId },
      data: { isVerified: true },
    });
  }

  const status = ready ? "connected" : "pending";
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/earnings?connect=${status}`);
}
