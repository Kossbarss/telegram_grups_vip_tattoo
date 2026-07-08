import { z } from "zod";

export const saveCalculationSchema = z.object({
  client_id: z.string().uuid().optional().or(z.literal("")),
  hours: z.coerce.number().positive("Вкажіть кількість годин"),
  size_option_id: z.string().uuid().optional().or(z.literal("")),
  style_option_id: z.string().uuid().optional().or(z.literal("")),
  color_option_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().optional(),
});
