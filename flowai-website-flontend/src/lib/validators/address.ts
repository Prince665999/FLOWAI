import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().max(60).optional().or(z.literal("")),
  full_name: z.string().min(2, "Enter the recipient name"),
  phone: z.string().max(50).optional().or(z.literal("")),
  line1: z.string().min(2, "Enter a street address"),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2, "Enter a city"),
  state: z.string().max(120).optional().or(z.literal("")),
  postal_code: z.string().max(40).optional().or(z.literal("")),
  country: z.string().length(2, "Use a 2-letter country code"),
  is_default: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
