import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await db.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status !== "OPEN") return NextResponse.json({ error: "Job is no longer available" }, { status: 409 });
  if (job.customerId === userId) return NextResponse.json({ error: "You cannot accept your own job" }, { status: 400 });

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Ensure driver exists in DB
  await db.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "Haul Driver",
      avatarUrl: clerkUser.imageUrl,
      role: "DRIVER",
    },
  });

  const updated = await db.job.update({
    where: { id },
    data: {
      driverId: userId,
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
    include: {
      customer: { select: { id: true, name: true, avatarUrl: true } },
      driver: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(updated);
}
