import { AddressesManager } from "@/components/profile/AddressesManager";
import { getAddresses } from "@/lib/actions/addresses";

export default async function AddressesPage() {
  const addresses = await getAddresses();

  return <AddressesManager addresses={addresses} />;
}
