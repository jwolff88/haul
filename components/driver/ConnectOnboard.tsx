"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DriverProfile } from "@prisma/client";

export default function ConnectOnboard({ profile }: { profile: DriverProfile | null }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start Stripe setup");
      setLoading(false);
    }
  };

  if (profile?.isVerified && profile.stripeAccountId) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-5 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
          <div>
            <div className="font-bold text-gray-900">Stripe payouts connected</div>
            <div className="text-sm text-gray-600 mt-0.5">
              You&apos;ll receive payouts automatically after each completed haul.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profile?.stripeAccountId && !profile.isVerified) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-gray-900">Stripe setup incomplete</div>
              <div className="text-sm text-gray-600 mt-0.5">
                Finish setting up your account to receive payouts.
              </div>
            </div>
          </div>
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><ExternalLink className="w-4 h-4 mr-2" /> Continue Stripe Setup</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardContent className="p-5">
        <h3 className="font-bold text-gray-900 mb-1">Set up payouts to get paid</h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your bank account via Stripe to receive your earnings after each haul. Takes about 5 minutes.
        </p>
        <div className="space-y-2 text-sm text-gray-500 mb-5">
          {["You keep 85% of every job", "Direct deposit to your bank account", "Payouts sent immediately after completion"].map((point) => (
            <div key={point} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              {point}
            </div>
          ))}
        </div>
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11 font-bold"
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><ExternalLink className="w-4 h-4 mr-2" /> Connect Bank Account</>
          )}
        </Button>
        <p className="text-xs text-gray-400 text-center mt-3">Powered by Stripe · Your banking info is never stored on Haul</p>
      </CardContent>
    </Card>
  );
}
