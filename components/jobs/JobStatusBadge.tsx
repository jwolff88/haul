import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type JobStatus } from "@/types";
import { cn } from "@/lib/utils";

const colors: Record<JobStatus, string> = {
  OPEN: "bg-green-100 text-green-700 border-green-200",
  ACCEPTED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
  COMPLETED: "bg-gray-100 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-100 text-red-600 border-red-200",
};

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge className={cn("border font-medium", colors[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
