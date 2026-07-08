import { z } from "zod";

export const orderSchema = z.object({
  client_id: z.string().uuid("Оберіть клієнта"),
  title: z.string().min(1, "Вкажіть назву замовлення"),
  description: z.string().optional(),
  price: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  scheduled_at: z.string().optional(),
});
