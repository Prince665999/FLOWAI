import { z } from "zod"; export const ticketSchema=z.object({subject:z.string().min(3),description:z.string().min(3),priority:z.string().default("normal"),order_id:z.number().int().optional()});
