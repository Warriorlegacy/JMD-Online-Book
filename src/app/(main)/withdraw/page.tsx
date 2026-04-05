import { getMainDashboardData } from "@/lib/data";
import { WithdrawPageClient } from "./page-client";

export default async function WithdrawPage() {
  const data = await getMainDashboardData();

  return (
    <WithdrawPageClient
      paymentMethods={data.paymentMethods.filter((item) => item.for_withdraw !== false)}
      minWithdraw={
        Number(data.siteSettings.find((item) => item.key === "min_withdraw")?.value ?? 200)
      }
      currentBalance={Number(data.profile?.balance ?? 0)}
    />
  );
}
