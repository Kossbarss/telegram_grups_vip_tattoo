import { z } from "zod";

export const portfolioUploadSchema = z.object({
  title: z.string().optional(),
  tags: z.string().optional(), // comma-separated, parsed in the action
});

export function parseTags(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
