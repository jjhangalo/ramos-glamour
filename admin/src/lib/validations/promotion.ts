import * as z from "zod";

export const promotionSchema = z.object({
  product_id: z
    .string({ message: "Selecciona um produto." })
    .uuid("ID de produto inválido."),
  promo_price: z.coerce
    .number({ message: "O preço promocional deve ser um número válido." })
    .positive("O preço promocional deve ser positivo."),
  is_active: z.boolean().default(true),
  ends_at: z
    .string()
    .optional()
    .nullable()
    .refine(
      (value) => {
        if (!value) return true;
        return !Number.isNaN(Date.parse(value));
      },
      { message: "Data de fim inválida." },
    ),
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;
