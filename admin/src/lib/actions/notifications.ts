"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationItem, OrderRecord } from "@/lib/types";
import { Resend } from "resend";

export async function sendOrderStatusEmail(
  orderId: string,
  newStatus: OrderRecord["status"],
  customerEmail: string,
) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY não configurada.");
    return { success: false, error: "Email configuration missing" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  let subject = "";
  let message = "";
  let preheader = "";

  switch (newStatus) {
    case "delivering":
      subject = "A sua encomenda está a caminho - Ramos Glamour";
      preheader = "A sua elegância está em trânsito";
      message = "O seu pedido foi despachado e já se encontra em trânsito. Em breve estará nas suas mãos.";
      break;
    case "refused":
      subject = "Atualização sobre a sua encomenda - Ramos Glamour";
      preheader = "Lamentamos, mas não foi possível processar a sua encomenda";
      message = "Ocorreu um imprevisto com o seu pedido. Por favor, entre em contacto connosco para mais detalhes.";
      break;
    case "delivered":
      subject = "A sua encomenda foi entregue - Ramos Glamour";
      preheader = "A sua encomenda chegou ao destino";
      message = "Esperamos que aprecie a sua nova aquisição. Obrigado por escolher a Ramos Glamour.";
      break;
    default:
      return { success: false, error: "No email template for this status" };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FCF9F6; font-family: 'Times New Roman', Times, serif; color: #121212;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FCF9F6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 1px solid #C5A059; padding: 40px;">
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <h1 style="color: #C5A059; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">Ramos Glamour</h1>
                  <div style="width: 50px; height: 1px; background-color: #C5A059; margin-top: 10px;"></div>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px;">
                  <h2 style="font-size: 18px; font-weight: normal; margin: 0; letter-spacing: 1px;">${preheader}</h2>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 30px; line-height: 1.6; font-size: 16px; color: #4a4a4a;">
                  <p>Olá,</p>
                  <p>${message}</p>
                  <p style="margin-top: 20px;"><strong>ID da Encomenda:</strong> #${orderId.slice(0, 8).toUpperCase()}</p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top: 20px; border-top: 1px solid #f0f0f0;">
                  <p style="font-size: 12px; color: #999; letter-spacing: 1px; text-transform: uppercase;">
                    Luxo & Sofisticação
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "Ramos Glamour <noreply@ramosglamour.com>",
      to: [customerEmail],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Erro ao enviar email via Resend:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Erro inesperado no envio de email:", err);
    return { success: false, error: "Erro interno no servidor de email" };
  }
}

export async function getUnreadNotifications() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as NotificationItem[];
}

export async function markNotificationsAsRead(ids: string[]) {
  if (!ids.length) {
    return { success: true };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .in("id", ids);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
