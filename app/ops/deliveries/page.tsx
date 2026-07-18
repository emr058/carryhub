import { getDeliveries } from "@/app/actions/delivery";
import DeliveriesPageClient from "./page-client";

export const revalidate = 0; // Disable caching

export default async function OpsDeliveriesPage() {
  const result = await getDeliveries();
  const deliveries = result.success ? result.deliveries : [];

  // Serialize Decimal and format it for client component compatibility
  const serializedDeliveries = (deliveries || []).map(d => ({
    ...d,
    price: `₺${Number(d.price).toLocaleString("tr-TR")}`
  }));

  return <DeliveriesPageClient initialDeliveries={serializedDeliveries} />;
}
