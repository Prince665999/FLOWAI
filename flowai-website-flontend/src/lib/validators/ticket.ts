import { z } from "zod";

export const ticketSchema = z.object({
  subject: z.string().min(3, "Enter a subject"),
  description: z.string().min(8, "Describe the issue"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  order_id: z.number().int().optional(),
});

export type TicketInput = z.infer<typeof ticketSchema>;
