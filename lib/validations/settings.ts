import { z } from "zod";

export const masterSettingsSchema = z.object({
  hourly_rate: z.coerce.number().min(0, "Ставка не може бути відʼємною"),
  currency: z.string().min(1).max(8),
  min_price: z.coerce.number().min(0, "Мінімальна ціна не може бути відʼємною"),
});

export const calculatorOptionSchema = z.object({
  category: z.enum(["size", "style", "color_complexity"]),
  label: z.string().min(1, "Вкажіть назву"),
  multiplier: z.coerce.number().min(0, "Множник не може бути відʼємним"),
});

export const profileSchema = z.object({
  display_name: z.string().min(1, "Вкажіть ім'я"),
  business_name: z.string().optional(),
});
