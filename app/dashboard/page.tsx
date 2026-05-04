import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// After sign-in, send customers to post-job, drivers to browse
export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  redirect("/my-jobs");
}
