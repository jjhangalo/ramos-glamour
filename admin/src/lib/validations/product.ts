import * as z from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.coerce
    .number({
      message: "O stock deve ser um número válido.",
    })
    .min(0, "O stock não pode ser negativo."),
  is_available: z.boolean().default(true),
  price_override: z.coerce
    .number()
    .min(0, "O preço não pode ser negativo.")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
});

export const productSchema = z.object({
  name: z
    .string({
      message: "O nome é obrigatório.",
    })
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(100, "O nome não pode exceder 100 caracteres."),
  description: z
    .string({
      message: "A descrição é obrigatória.",
    })
    .min(10, "A descrição deve ter pelo menos 10 caracteres."),
  price: z.coerce
    .number({
      message: "O preço base deve ser um número válido.",
    })
    .min(0, "O preço não pode ser negativo."),
  category_ids: z
    .array(z.string())
    .min(1, "Selecciona pelo menos uma categoria."),
  stock: z.coerce
    .number({
      message: "O stock deve ser um número válido.",
    })
    .min(0, "O stock não pode ser negativo."),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

export type VariantFormValues = z.infer<typeof variantSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
