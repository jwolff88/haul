"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PaymentForm from "@/components/stripe/PaymentForm";
import type { JobStatus } from "@/types";

type Props = {
  job: {
    id: string;
    status: JobStatus;
    offeredPrice: number;
    stripePaymentIntentId: string | null;
    driverId: string | null;
    driver: { driverProfile: { stripeAccountId: string | null } | null } | null;
  };
  isCustomer: boolean;
  isDriver: boolean;
  paymentJustSucceeded: boolean;
};

export default function JobActions({ job, isCustomer, isDriver, paymentJustSucceeded }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Auto-open payment form if returning from Stripe redirect with success
  useEffect(() => {
    if (paymentJustSucceeded) {
      router.refresh();
    }
  }, [paymentJustSucceeded, router]);

  const driverHasStripe = !!job.driver?.driverProfile?.stripeAccountId;

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Job complete! Driver payout sent.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete job");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this job?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Job cancelled.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel job");
    } finally {
      setLoading(false);
    }
  };

  // --- Customer views ---

  if (isCustomer && job.status === "ACCEPTED") {
    if (!driverHasStripe) {
      return (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-5 text-center">
            <p className="text-yellow-800 font-medium text-sm">
              Your driver is setting up their payment account. You&apos;ll be notified when you can pay.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-orange-200">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900">Driver accepted — pay to confirm</h3>
            <p className="text-sm text-gray-500 mt-1">
              Payment is held securely. Released to the driver only after you confirm the job is done.
            </p>
          </div>
          {showPayment ? (
            <PaymentForm
              jobId={job.id}
              amount={job.offeredPrice}
              onSuccess={() => router.refresh()}
            />
          ) : (
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11 font-bold"
              onClick={() => setShowPayment(true)}
            >
              Pay ${job.offeredPrice.toFixed(2)} to Lock In Driver
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel Job
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCustomer && job.status === "IN_PROGRESS") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-5 space-y-3">
          <div>
            <h3 className="font-bold text-gray-900">Your driver is on the way!</h3>
            <p className="text-sm text-gray-600 mt-1">
              Tap below once everything has been delivered and you&apos;re happy with the haul. This releases payment to your driver.
            </p>
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white h-11 font-bold"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><CheckCircle className="w-4 h-4 mr-2" /> Confirm Job Complete</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCustomer && job.status === "OPEN") {
    return (
      <Button
        variant="outline"
        className="w-full border-red-200 text-red-600 hover:bg-red-50"
        onClick={handleCancel}
        disabled={loading}
      >
        <XCircle className="w-4 h-4 mr-2" />
        Cancel Job
      </Button>
    );
  }

  if (isCustomer && job.status === "COMPLETED") {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-5 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-bold text-gray-900">Haul complete!</p>
          <p className="text-sm text-gray-500 mt-1">Driver payout sent. Thanks for using Haul.</p>
        </CardContent>
      </Card>
    );
  }

  // --- Driver views ---

  if (isDriver && job.status === "ACCEPTED") {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-5 text-center">
          <p className="font-bold text-gray-900 text-sm">Waiting for customer payment</p>
          <p className="text-gray-500 text-sm mt-1">
            The customer needs to pay before you begin. You&apos;ll see the status update here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isDriver && job.status === "IN_PROGRESS") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-5 text-center">
          <p className="font-bold text-gray-900">Go get it done!</p>
          <p className="text-sm text-gray-600 mt-1">
            Customer will confirm completion. Your payout of ${(job.offeredPrice * 0.85).toFixed(2)} will be sent immediately after.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}
