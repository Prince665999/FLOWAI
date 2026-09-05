import { z } from "zod"; export const checkoutSchema=z.object({address_id:z.number().int().positive(),idempotency_key:z.string().min(8),payment_method:z.string().default("test")});
