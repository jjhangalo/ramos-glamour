import * as z from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string({
      message: "O nome é obrigatório.",
    })
    .min(2, "O nome deve ter pelo menos 2 caracteres."),
  slug: z
    .string({
      message: "O slug é obrigatório.",
    })
    .min(2, "O slug deve ter pelo menos 2 caracteres."),
  parent_id: z.string().nullable().optional().or(z.literal("").transform(() => null)),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
