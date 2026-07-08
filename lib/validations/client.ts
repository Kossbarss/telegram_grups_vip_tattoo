import { z } from "zod";

export const clientSchema = z.object({
  full_name: z.string().min(1, "Вкажіть ім'я клієнта"),
  phone: z.string().optional(),
  email: z.union([z.string().email("Невірний email"), z.literal("")]).optional(),
  instagram: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
