import { redirect } from "next/navigation";

import { SectionHeading } from "@/components/ui/section-heading";
import { TransactionList } from "@/components/lists/transaction-list";
import { getCurrentProfile, getMainDashboardData } from "@/lib/data";
import { getSession } from "@/lib/auth";

export default async function TransactionsPage() {
  const [session, profile] = await Promise.all([getSession(), getCurrentProfile()]);
  if (!session) redirect("/login");

  const data = await getMainDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Transactions"
        title="Wallet ledger"
        subtitle="Every request and adjustment is preserved with its approval status."
      />
      <TransactionList
        initialTransactions={data.transactions}
        userId={session.id}
      />
    </div>
  );
}
