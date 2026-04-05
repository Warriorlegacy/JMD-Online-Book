import { AdminTransactionsClient } from "./page-client";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminTransactionsPage() {
  const data = await getAdminDashboardData();

  return <AdminTransactionsClient transactions={data.transactions} />;
}
