"use client";

import { FinanceView } from "@/components/carryhub-views";

export default function FinancePageClient({
  initialTransactions,
  summary
}: {
  initialTransactions: any[];
  summary: any;
}) {
  return <FinanceView initialTransactions={initialTransactions} summary={summary} />;
}
