"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, DollarSign, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JOB_SIZE_LABELS, STATUS_LABELS, type JobWithRelations } from "@/types";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  OPEN: "bg-green-100 text-green-700 border-green-200",
  ACCEPTED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-orange-100 text-orange-700 border-orange-200",
  COMPLETED: "bg-gray-100 text-gray-600 border-gray-200",
  CANCELLED: "bg-red-100 text-red-600 border-red-200",
};

export default function JobCard({
  job,
  showAccept = false,
  onAccept,
  accepting = false,
}: {
  job: JobWithRelations;
  showAccept?: boolean;
  onAccept?: (id: string) => void;
  accepting?: boolean;
}) {
  return (
    <Card className="border hover:border-orange-200 hover:shadow-sm transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{job.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-2 mt-0.5">{job.description}</p>
          </div>
          <Badge className={cn("shrink-0 text-xs border", statusColors[job.status])}>
            {STATUS_LABELS[job.status]}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <span className="truncate">{job.pickupAddress}</span>
          </div>
          <div className="flex items-start gap-1.5 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <span className="truncate">{job.dropoffAddress}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {JOB_SIZE_LABELS[job.size].split(" ")[0]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-1 font-bold text-orange-600">
            <DollarSign className="w-4 h-4" />
            {job.offeredPrice.toFixed(2)}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            render={<Link href={`/job/${job.id}`} />}
          >
            View Details
          </Button>
          {showAccept && job.status === "OPEN" && (
            <Button
              size="sm"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              disabled={accepting}
              onClick={() => onAccept?.(job.id)}
            >
              {accepting ? "Accepting..." : "Accept Job"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
