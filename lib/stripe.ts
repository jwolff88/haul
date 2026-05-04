import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLATFORM_FEE_PERCENT = 0.15;

export function calculateFees(offeredPrice: number) {
  const platformFee = Math.round(offeredPrice * PLATFORM_FEE_PERCENT * 100) / 100;
  const driverPayout = Math.round((offeredPrice - platformFee) * 100) / 100;
  return { platformFee, driverPayout };
}
