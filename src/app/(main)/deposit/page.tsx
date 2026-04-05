import { getMainDashboardData } from "@/lib/data";
import { DepositPageClient } from "./page-client";

export default async function DepositPage() {
  const data = await getMainDashboardData();

  return (
    <DepositPageClient
      paymentMethods={data.paymentMethods.filter((item) => item.for_deposit !== false)}
      minDeposit={
        Number(data.siteSettings.find((item) => item.key === "min_deposit")?.value ?? 100)
      }
    />
  );
}
