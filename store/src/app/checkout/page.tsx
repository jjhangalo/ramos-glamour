import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { createClient } from "@/lib/supabase/server";
import PageWithHeaderOffset from "@/components/layout/PageWithHeaderOffset";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select(
      "id, label, recipient_name, phone, province, city, neighborhood, street, reference, is_default",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <PageWithHeaderOffset>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-charcoal/65">
            Checkout
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-brand-charcoal">
            Finalizar encomenda
          </h1>
        </div>

        <CheckoutClient
          addresses={addresses ?? []}
          userName={user.user_metadata.full_name ?? user.email ?? "Cliente"}
        />
      </main>
    </PageWithHeaderOffset>
  );
}
