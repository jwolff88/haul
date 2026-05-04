import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

// Proxy so existing `stripe.xxx` call sites keep working without changes
export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    return getStripe()[prop as keyof Stripe];
  },
});

export const PLATFORM_FEE_PERCENT = 0.15;

export function calculateFees(offeredPrice: number) {
  const platformFee = Math.round(offeredPrice * PLATFORM_FEE_PERCENT * 100) / 100;
  const driverPayout = Math.round((offeredPrice - platformFee) * 100) / 100;
  return { platformFee, driverPayout };
}
