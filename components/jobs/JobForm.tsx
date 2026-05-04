"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MapPin, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { JobSize } from "@/types";

const jobSchema = z.object({
  title: z.string().min(5, "Give it a short title (at least 5 chars)"),
  description: z.string().min(10, "Tell us more about what needs to be moved"),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]),
  pickupAddress: z.string().min(5, "Enter a pickup address"),
  dropoffAddress: z.string().min(5, "Enter a dropoff address"),
  offeredPrice: z.string().transform((v) => parseFloat(v)).pipe(z.number().min(20, "Minimum offer is $20").max(5000, "Max $5,000")),
  scheduledFor: z.string().optional(),
});

type JobFormInput = z.input<typeof jobSchema>;
type JobFormData = z.output<typeof jobSchema>;

const sizes: { value: JobSize; label: string; desc: string; example: string }[] = [
  { value: "SMALL", label: "Small", desc: "Single item", example: "Chair, TV, toolbox" },
  { value: "MEDIUM", label: "Medium", desc: "Half truck load", example: "Couch + few boxes" },
  { value: "LARGE", label: "Large", desc: "Full truck load", example: "Full room of stuff" },
  { value: "XLARGE", label: "XL", desc: "Trailer needed", example: "ATV, equipment, big hauls" },
];

export default function JobForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormInput, unknown, JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { size: "MEDIUM" },
  });

  const selectedSize = watch("size");
  const offeredPriceRaw = watch("offeredPrice");
  const offeredPrice = parseFloat(offeredPriceRaw as unknown as string) || 0;
  const platformFee = offeredPrice ? Math.round(offeredPrice * 0.15 * 100) / 100 : 0;
  const driverEarns = offeredPrice ? Math.round((offeredPrice - platformFee) * 100) / 100 : 0;

  const onSubmit = async (data: JobFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to post job");
      }

      const job = await res.json();
      toast.success("Job posted! Drivers will be notified.");
      router.push(`/job/${job.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">What needs to be hauled?</Label>
        <Input
          id="title"
          placeholder="e.g. Couch from Facebook Marketplace pickup"
          {...register("title")}
          className={errors.title ? "border-red-400" : ""}
        />
        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Details</Label>
        <Textarea
          id="description"
          placeholder="Describe the items, any special handling needs, stairs involved, etc."
          rows={3}
          {...register("description")}
          className={errors.description ? "border-red-400" : ""}
        />
        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
      </div>

      {/* Size */}
      <div className="space-y-2">
        <Label>Load size</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {sizes.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setValue("size", s.value)}
              className={cn(
                "border-2 rounded-xl p-3 text-left transition-all",
                selectedSize === s.value
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="font-bold text-gray-900 text-sm">{s.label}</div>
              <div className="text-gray-500 text-xs">{s.desc}</div>
              <div className="text-gray-400 text-xs mt-1 italic">{s.example}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="pickupAddress" className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-green-500" /> Pickup address
          </Label>
          <Input
            id="pickupAddress"
            placeholder="123 Main St, Butte MT"
            {...register("pickupAddress")}
            className={errors.pickupAddress ? "border-red-400" : ""}
          />
          {errors.pickupAddress && <p className="text-red-500 text-xs">{errors.pickupAddress.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dropoffAddress" className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-500" /> Dropoff address
          </Label>
          <Input
            id="dropoffAddress"
            placeholder="456 Oak Ave, Butte MT"
            {...register("dropoffAddress")}
            className={errors.dropoffAddress ? "border-red-400" : ""}
          />
          {errors.dropoffAddress && <p className="text-red-500 text-xs">{errors.dropoffAddress.message}</p>}
        </div>
      </div>

      {/* Scheduling */}
      <div className="space-y-1.5">
        <Label htmlFor="scheduledFor">When do you need this done?</Label>
        <Input
          id="scheduledFor"
          type="datetime-local"
          {...register("scheduledFor")}
          min={new Date().toISOString().slice(0, 16)}
        />
        <p className="text-xs text-gray-500">Leave blank for ASAP — drivers will see it immediately.</p>
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <Label htmlFor="offeredPrice" className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-orange-500" /> Your offer
        </Label>
        <Input
          id="offeredPrice"
          type="number"
          placeholder="75"
          {...register("offeredPrice")}
          className={cn("text-lg font-bold", errors.offeredPrice ? "border-red-400" : "")}
        />
        {errors.offeredPrice && <p className="text-red-500 text-xs">{errors.offeredPrice.message}</p>}

        {offeredPrice > 0 && (
          <Card className="mt-2 bg-gray-50 border-gray-200">
            <CardContent className="py-3 px-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Your offer</span>
                <span className="font-medium">${offeredPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Haul platform fee (15%)</span>
                <span className="text-gray-500">−${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5">
                <span className="font-semibold text-gray-900">Driver earns</span>
                <span className="font-bold text-green-600">${driverEarns.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Payment is held securely. You only get charged when a driver accepts. Released after you confirm the job is done.</p>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base font-bold"
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
        ) : (
          "Post Haul Job →"
        )}
      </Button>
    </form>
  );
}
