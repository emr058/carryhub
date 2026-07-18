import { getCompanyDeliveries } from "@/app/actions/delivery";
import CompanyPageClient from "./page-client";

export const revalidate = 0; // Disable caching

export default async function CompanyPage() {
  const result = await getCompanyDeliveries();
  const deliveries = result.success ? result.deliveries : [];
  const companyId = result.success ? result.companyId : null;

  return (
    <CompanyPageClient
      initialDeliveries={deliveries}
      companyId={companyId}
    />
  );
}
