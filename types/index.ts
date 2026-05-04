import type { Job, User, DriverProfile, Rating, JobStatus, JobSize } from "@prisma/client";

export type { JobStatus, JobSize };

export type JobWithRelations = Job & {
  customer: Pick<User, "id" | "name" | "avatarUrl">;
  driver?: (Pick<User, "id" | "name" | "avatarUrl"> & {
    driverProfile?: DriverProfile | null;
  }) | null;
  ratings?: Rating[];
};

export type DriverWithProfile = User & {
  driverProfile: DriverProfile | null;
};

export const JOB_SIZE_LABELS: Record<JobSize, string> = {
  SMALL: "Small (single item / truck bed)",
  MEDIUM: "Medium (half truck load)",
  LARGE: "Large (full truck load)",
  XLARGE: "XL (trailer needed)",
};

export const JOB_SIZE_ICONS: Record<JobSize, string> = {
  SMALL: "📦",
  MEDIUM: "🛻",
  LARGE: "📦📦",
  XLARGE: "🚛",
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  OPEN: "Open",
  ACCEPTED: "Driver Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
