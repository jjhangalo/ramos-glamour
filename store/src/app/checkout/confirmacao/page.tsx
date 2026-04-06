import { CheckoutConfirmationClient } from "@/components/checkout/CheckoutConfirmationClient";

type CheckoutConfirmationPageProps = {
  searchParams?: Promise<{
    whatsapp?: string;
  }>;
};

export default async function CheckoutConfirmationPage({
  searchParams,
}: CheckoutConfirmationPageProps) {
  const params = (await searchParams) ?? {};

  return <CheckoutConfirmationClient whatsappUrl={params.whatsapp ?? null} />;
}
