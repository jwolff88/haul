import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const createJobSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]),
  pickupAddress: z.string().min(5),
  dropoffAddress: z.string().min(5),
  offeredPrice: z.number().min(20).max(5000),
  scheduledFor: z.string().optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Upsert user in our DB (first time they post a job)
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "Haul User",
      avatarUrl: clerkUser.imageUrl,
    },
  });

  const { scheduledFor, offeredPrice, ...rest } = parsed.data;
  const platformFee = Math.round(offeredPrice * 0.15 * 100) / 100;
  const driverPayout = Math.round((offeredPrice - platformFee) * 100) / 100;

  const job = await db.job.create({
    data: {
      ...rest,
      offeredPrice,
      platformFee,
      driverPayout,
      customerId: userId,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    },
    include: {
      customer: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(job, { status: 201 });
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const view = searchParams.get("view"); // "customer" | "driver" | "browse"

  const where =
    view === "customer"
      ? { customerId: userId, ...(status ? { status: status as never } : {}) }
      : view === "driver"
      ? { driverId: userId, ...(status ? { status: status as never } : {}) }
      : { status: "OPEN" as const }; // browse = all open jobs

  const jobs = await db.job.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, avatarUrl: true } },
      driver: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(jobs);
}
