import Stripe from "stripe";
import config from "../config";

if (!config.stripe_secret_key) {
  throw new Error("Missing Stripe secret key")
}

export const stripe = new Stripe(config.stripe_secret_key)
