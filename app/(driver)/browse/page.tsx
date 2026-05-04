"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Navbar from "@/components/shared/Navbar";
import JobCard from "@/components/jobs/JobCard";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobWithRelations } from "@/types";

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs?view=browse");
      if (!res.ok) throw new Error("Failed to load jobs");
      setJobs(await res.json());
    } catch {
      toast.error("Could not load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    // Poll for new jobs every 30s — simple real-time without websockets for MVP
    const interval = setInterval(fetchJobs, 30_000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const handleAccept = async (jobId: string) => {
    setAccepting(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/accept`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to accept job");
      }
      toast.success("Job accepted! Check My Hauls for details.");
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not accept job");
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="driver" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Available Jobs</h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? "Loading..." : `${jobs.length} open job${jobs.length !== 1 ? "s" : ""} near you`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {loading && jobs.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">No open jobs right now. Check back soon — new jobs post constantly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                showAccept
                onAccept={handleAccept}
                accepting={accepting === job.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
