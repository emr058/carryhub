import { getCourierDeliveries, getCourierDailyStats } from "@/app/actions/delivery";
import { CourierView } from "@/components/carryhub-views";

export const revalidate = 0; // Disable caching

export default async function CourierPage() {
  const result = await getCourierDeliveries();
  const statsResult = await getCourierDailyStats();

  const deliveries = result.success ? result.deliveries : [];
  const courierId = result.success ? result.courierId : null;
  
  const dailyStats = {
    count: statsResult.success ? statsResult.count : 0,
    earnings: statsResult.success ? statsResult.earnings : 0
  };

  // Serialize Decimal and format it for the client component
  const serializedDeliveries = (deliveries || []).map(d => ({
    ...d,
    price: `₺${Number(d.price).toLocaleString("tr-TR")}`
  }));

  return (
    <CourierView
      initialDeliveries={serializedDeliveries}
      courierId={courierId}
      initialStats={dailyStats}
    />
  );
}
