export const dynamic = "force-dynamic";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// POST — create or resume Stripe Express onboarding for a driver
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Ensure user row exists
  const email = clerkUser.emailAddresses[0].emailAddress;
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "Driver",
      avatarUrl: clerkUser.imageUrl,
      role: "DRIVER",
    },
  });

  let profile = await db.driverProfile.findUnique({ where: { userId } });

  // Create Stripe Express account if driver doesn't have one yet
  if (!profile?.stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: { transfers: { requested: true } },
      business_type: "individual",
      metadata: { userId },
    });

    profile = await db.driverProfile.upsert({
      where: { userId },
      update: { stripeAccountId: account.id },
      create: {
        userId,
        vehicleType: "Pickup Truck",
        stripeAccountId: account.id,
      },
    });
  }

  const accountId = profile.stripeAccountId!;

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${APP_URL}/api/stripe/connect?refresh=1`,
    return_url: `${APP_URL}/api/stripe/connect/return?accountId=${accountId}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// GET — return current Connect status for the driver
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.driverProfile.findUnique({ where: { userId } });
  if (!profile?.stripeAccountId) {
    return NextResponse.json({ connected: false });
  }

  const account = await stripe.accounts.retrieve(profile.stripeAccountId);
  const ready = account.charges_enabled && account.payouts_enabled;

  if (ready && !profile.isVerified) {
    await db.driverProfile.update({
      where: { userId },
      data: { isVerified: true },
    });
  }

  return NextResponse.json({
    connected: true,
    ready,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    accountId: profile.stripeAccountId,
  });
}
