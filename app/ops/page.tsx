import { getOpsDashboardStats } from "@/app/actions/ops";
import { OpsDashboardClient } from "./page-client";

export default async function OpsDashboardPage() {
  const data = await getOpsDashboardStats();

  return <OpsDashboardClient data={data} />;
}
