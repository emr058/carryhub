import { getTransactions, generateStatement } from "@/app/actions/finance";
import FinancePageClient from "./page-client";

export const revalidate = 0; // Disable caching

export default async function OpsFinancePage() {
  const transactionsResult = await getTransactions();
  const statementResult = await generateStatement();

  const transactions = transactionsResult.success ? transactionsResult.transactions : [];

  // Serialize Decimals to string/numbers for client-side compatibility
  const serializedTransactions = (transactions || []).map(t => ({
    ...t,
    amount: Number(t.amount)
  }));

  const summary = {
    totalCommission: statementResult.success ? statementResult.totalCommission : 0,
    totalValue: statementResult.success ? statementResult.totalValue : 0,
    count: statementResult.success ? statementResult.count : 0
  };

  return (
    <FinancePageClient
      initialTransactions={serializedTransactions}
      summary={summary}
    />
  );
}
