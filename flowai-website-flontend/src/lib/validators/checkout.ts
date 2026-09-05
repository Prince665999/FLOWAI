import { z } from "zod";

export const checkoutSchema = z.object({
  address_id: z.number().int().positive("Choose a shipping address"),
  idempotency_key: z.string().min(8),
  payment_method: z.string().default("test"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
